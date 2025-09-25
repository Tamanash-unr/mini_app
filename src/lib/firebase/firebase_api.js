import { getDoc, doc, setDoc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import aes from 'crypto-js/aes'
import enc from 'crypto-js/enc-utf8'

import { db } from "./firebaseConfig";
import { base64UrlEncode, base64UrlDecode } from "../helper";

export const validateUser = async (userId) => {
    try {
        if(!userId) {
            throw Error("Invalid User Id")
        }

        const docRef = doc(db, 'users', (userId).toString())
        const docSnapshot = await getDoc(docRef)

        if(!docSnapshot.exists()){
            throw Error("User does not Exist!")
        }

        const data = docSnapshot.data()
        const appData = data.appData

        return {
            status: true,
            data: appData
        }
    } catch (error) {
        return {
            status: false,
            message: error.message
        }
    }
}

export const createUser = async (data, referredBy) => {
    try {
        if(!data.id){
            throw new Error("Invalid User Data")
        }    
        
        const docRef = doc(db, 'users', (data.id).toString())
        const docSnapshot = await getDoc(docRef)

        //Creating Referral ID
        const base64Referral = aes.encrypt((data.id).toString(), process.env.REACT_APP_SECRET_KEY).toString()
        const referral = base64UrlEncode(base64Referral)
        
        let referData = ''
        if(referredBy){
            referData = await getReferredData(referredBy, data.first_name);
        }

        if(docSnapshot.exists()){
            throw new Error("User Already Exists!")
        }

        const docData = {
            firstName: data.first_name ?? `${(data.id).toString()}`,
            lastName: data.last_name ?? '',
            username: data.username ?? `User#${(data.id).toString()}`,
            languageCode: data.language_code ?? '',
            createdAt: Date().toString(),
            updatedAt: Date().toString(),
            appData: {
                nickname: "",
                boostLevel: 0,
                coinsEarned: 0,
                tickets: 0,
                dailyStreak: 0,
                friendsCount: 0,
                isMining: false,
                lastLoggedIn: "",
                miningStartedAt: "",
                referrals: [],
                referredBy: referData,
                referralId: referral,
                referralReward: 0,
                tasks: {
                    daily: {},
                    social: {}
                }
            }
        }

        await setDoc(doc(db, "users", (data.id).toString()), docData)

        return {
            status: true,
            referralID: referData
        }
    } catch (error) {
        return {
            status: false,
            message: error.message
        }
    }
}

export const updateDailyClaim = async (id, data, task) => {
    try {
        if(!id){
            throw new Error("Invalid User")
        }

        const docRef = doc(db, 'users', (id).toString())

        await updateDoc(docRef, {
            'appData.dailyStreak': data.dailyStreak,
            'appData.coinsEarned': data.coinsEarned,
            'appData.tickets': data.tickets,
            'appData.lastLoggedIn': Date().toString(),
            'appData.tasks.daily': {
                [task.id] : task.data
            },
            updatedAt: Date().toString(),
        })

        return {
            status: true
        }
    } catch (error) {
        return {
            status: false,
            message: error.message
        }
    }
}

export const updateEarnedCoins = async (id, coinsEarned, ticketsRemaining) => {
    try {
        if(!id){
            throw new Error("Invalid User")
        }

        const docRef = doc(db, 'users', (id).toString())

        await updateDoc(docRef, {
            'appData.coinsEarned': coinsEarned,
            'appData.tickets': ticketsRemaining,
            updatedAt: Date().toString(),
        })

        await serverUpdateMining(id, false)

        return {
            status: true
        }
    } catch (error) {
        return {
            status: false,
            message: error.message
        }
    }
}

export const claimReferralReward = async (id, reward) => {
    try {
        if(!id){
            throw new Error("Invalid User")
        }

        const docRef = doc(db, 'users', (id).toString())

        await updateDoc(docRef, {
            'appData.coinsEarned': increment(reward),
            'appData.referralReward': 0,
            updatedAt: Date().toString(),
        })

        return {
            status: true
        }
    } catch (error) {
        return {
            status: false,
            message: error.message
        }
    }
}

export const updateBoostLevel = async (id, data) => {
    try {
        if(!id){
            throw new Error("Invalid User")
        }

        const docRef = doc(db, 'users', (id).toString())

        await updateDoc(docRef, {
            'appData.coinsEarned': data.coins,
            'appData.boostLevel': data.boost,
            updatedAt: Date().toString(),
        })

        return {
            status: true
        }
    } catch (error) {
        return {
            status: false,
            message: error.message
        }
    }
}

export const getReferredData = async (id, userName) => {
    try {
        if(!id){
            throw new Error("Invalid ID")
        }

        const base64Referral = base64UrlDecode(id)
        const dec_Data = aes.decrypt(base64Referral, process.env.REACT_APP_SECRET_KEY)
        const decryptedId = dec_Data.toString(enc)

        const docRef = doc(db, 'users', (decryptedId).toString())
        const docSnapshot = await getDoc(docRef)

        if(!docSnapshot.exists()){
            throw new Error("Invalid Referral ID")
        }

        await updateDoc(docRef, {
            'appData.referrals': arrayUnion(userName),
            'appData.friendsCount': increment(1),
            'appData.referralReward': increment(50),
            updatedAt: Date().toString(),
        })

        const data = docSnapshot.data()

        return data.firstName ?? ''
    } catch (error) {
        return error.message
    }
}

export const getTaskData = async () => {
    try {
        const docRef = doc(db, 'app', 'tasks');
        const docSnapshot = await getDoc(docRef)

        if(!docSnapshot.exists()){
            throw Error("Failed to retrieve Tasks!")
        }

        const data = docSnapshot.data()
        
        return {
            status: true,
            tasks: data,
        }
    } catch (error) {
        return {
            status: true,
            message: error.message,
        }
    }
}

export const updateTaskData = async (id, taskId, newTaskData, taskType, coinsEarned) => {
    try {
        if(!id){
            throw new Error("Invalid User")
        }

        const docRef = doc(db, 'users', (id).toString())
        const docSnapshot = await getDoc(docRef)

        if(!docSnapshot.exists()){
            throw Error("User does not Exist!")
        }

        const data = docSnapshot.data()
        const appData = data.appData

        const dailyTask = {
            'appData.coinsEarned': coinsEarned ?? appData.coinsEarned,
            'appData.tasks.daily': {...appData.tasks.daily,
                [taskId]: newTaskData
            },
            updatedAt: Date().toString(),
        }

        const socialTask = {
            'appData.coinsEarned': coinsEarned ?? appData.coinsEarned,
            'appData.tasks.social': {...appData.tasks.social,
                [taskId]: newTaskData
            },
            updatedAt: Date().toString(),
        }

        await updateDoc(docRef, taskType === 'daily' ? dailyTask : socialTask)

        return {
            status: true
        }
    } catch (error) {
        return {
            status: false,
            message: error.message
        }
    }
}

export const resetTasks = async (id) => {
    try {
        if(!id){
            throw new Error("Invalid User")
        }

        const docRef = doc(db, 'users', (id).toString())

        await updateDoc(docRef, {
            'appData.tasks.daily': {}
        })

        return {
            status: true
        }
    } catch (error) {
        return {
            status: false,
            message: error.message
        }
    }
}

export const serverUpdateMining =  async (id, start) => {
    try {
        if(!id){
            throw new Error("Invalid User")
        }

        const docRef = doc(db, 'users', (id).toString())

        await updateDoc(docRef, {
            'appData.isMining': start,
            'appData.miningStartedAt': start ? Date().toString() : ''
        })

        return {
            status: true
        }
    } catch (error) {
        return {
            status: false,
            message: error.message
        }
    }
}

export const updateUserBalance = async (id, coinsEarned, ticketsRemaining) => {
    try {
        if(!id){
            throw new Error("Invalid User")
        }

        const docRef = doc(db, 'users', (id).toString())

        await updateDoc(docRef, {
            'appData.coinsEarned': coinsEarned,
            'appData.tickets': ticketsRemaining,
            updatedAt: Date().toString(),
        })

        await serverUpdateMining(id, false)

        return {
            status: true
        }
    } catch (error) {
        return {
            status: false,
            message: error.message
        }
    }
}
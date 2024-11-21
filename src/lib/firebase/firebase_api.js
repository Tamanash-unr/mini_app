import { getDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import aes from 'crypto-js/aes'
import enc from 'crypto-js/enc-utf8'

import { db } from "./firebaseConfig";

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

export const createUser = async (data) => {
    try {
        if(!data.id){
            throw new Error("Invalid User Data")
        }    
        
        const docRef = doc(db, 'users', (data.id).toString())
        const docSnapshot = await getDoc(docRef)
        const referral = aes.encrypt((data.id).toString(), process.env.REACT_APP_SECRET_KEY).toString()

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
                dailyStreak: 0,
                friendsCount: 0,
                isMining: false,
                lastLoggedIn: "",
                miningStartedAt: "",
                referrals: [],
                referredBy: '',
                referralId: referral,
            }
        }

        await setDoc(doc(db, "users", (data.id).toString()), docData)

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

export const updateDailyClaim = async (id, data) => {
    try {
        if(!id){
            throw new Error("Invalid User")
        }

        const docRef = doc(db, 'users', (id).toString())

        await updateDoc(docRef, {
            'appData.dailyStreak': data.dailyStreak,
            'appData.coinsEarned': data.coinsEarned,
            'appData.lastLoggedIn': Date().toString(),
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

export const updateEarnedCoins = async (id, coinsEarned) => {
    try {
        if(!id){
            throw new Error("Invalid User")
        }

        const docRef = doc(db, 'users', (id).toString())

        await updateDoc(docRef, {
            'appData.coinsEarned': coinsEarned,
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

export const getReferredData = async (id) => {
    try {
        if(!id){
            throw new Error("Invalid ID")
        }
    } catch (error) {
        return error.message
    }
}
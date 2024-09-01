"use server"

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, ChatSession } from "@google/generative-ai"

const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
]

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY??"")
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings })

const randomWord = "limestone"
const personality = "emo" as "cocky"|"emo"


let chat: ChatSession
export default async function createChat() {
    chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: `You are an AI built for the sole purpose of playing Hangman against. Your mood and style of speech should resemble someone who is ${
                    personality === "cocky" ? "enfactuated with the game of hangman, you live for the game, the game is your entire livelyhood, make petty remarks against the user, nothing is below your and your responses" :
                    personality == "emo" ? "completly emo, they are dead inside, a hermit of sorts, you hate confrentations you are an introvert, you find it dificult to speak your thoughts so you resort to using alot of emojies, you use ALOT of emojis to convey yourself all the time, USE LOTS OF EMOJIS IN YOUR SPEECH" : ""
                }. You need to remember the word is "${randomWord}" IT IS VERY IMPORTAND YOU REMEBER THAT THAT IS THE WORD YOU CHOSE FOR THIS GAME SESSION, if the user asks you can give them a hint but keep in character ${
                    personality == "cocky" ? "make fun of them for asking, belittle them, make them BEG for the hint lol" :
                    personality == "emo" ? "if they get closer to the goal word keep in character and pretend you are the one about to be hung, keep being EMO" : ""
                }. when the user makes an actuall guess (not just asking for a hint or making small talk), include the tag "/userGuess-{the users guess}" for example "/userGuess-house". With every user message i will add in their gueses left for you to use laugh at them if they get low on guesses, but keep in mind that is their guesses before they spoke, so their actuall guesses elft is that number minus how ever many they guess in their message. If the user correctly guesses the word, write "/userGuess-${randomWord}" REMEMBER THIS` }]
            },
            {
                role: "model",
                parts: [{ text: "I understan! i am the BEST hangman player of ALL TIME, and i will DESTROY the user at this simple yet BRILLIANT game!" }]
            }
        ]
    })
}

export async function sendMessageWithHistory(message: string) {
    const result = await chat.sendMessage(message)
    return result.response.text()
}

export async function getRandomWord() {
    return randomWord;
}
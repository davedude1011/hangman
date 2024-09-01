"use client"

import { useEffect, useState } from "react"
import createChat, { getRandomWord, sendMessageWithHistory } from "~/server/gemini"

export default function HomePage() {
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState([] as {role: "user"|"bot", message: string}[])
  const [randomWord, setRandomWord] = useState("")
  const [guesses, setGuesses] = useState([] as string[])
  const maxUserGuesses = 15
  const [gameState, setGameState] = useState("playing" as "playing"|"lost"|"won")

  useEffect(() => {
    createChat()
      .catch(err => console.log(err))
    getRandomWord()
      .then((word) => setRandomWord(word))
      .catch(err => console.log(err))
  }, [])

  useEffect(() => {
    const userGuessRegex = /\/userGuess-([a-zA-Z0-9]+)/g

    const tempGuesses = [] // guesses must be characters!
    for (const message of messages) {
      if (message.role == "bot") {
        const userGuessMatches = [...message.message.matchAll(userGuessRegex)].map((match) => match[1])
        console.log(userGuessMatches)
        for (const match of userGuessMatches) {
          if (match) {
            const matchCharacterArray = match.split("")
            tempGuesses.push(...matchCharacterArray)
          }
        }
      }
    }

    function checkWinCondition(tempGuesses: string[]) {
      if (randomWord) {
        const randomWordSet = new Set(randomWord)
        const guessesSet = new Set(tempGuesses)
  
        for (const char of randomWordSet) {
          if (!guessesSet.has(char)) {
            return false
          }
        }
        return true
      }
      return false
    }
    if (gameState == "playing" && checkWinCondition(tempGuesses)) {
      setGameState("won")
      sendMessage("THIS IS AN AUTOMATED RESPONSE BY THE APPLICATION. THE USER HAS WON, REPLY LIKE YOU JUST REALIZED THAT THEY HAVE WON.")
    }

    setGuesses(tempGuesses)
  }, [messages, randomWord])

  function sendMessage(messageText: string) {
    const tempMessages = [...messages, {role: "user" as const, message: messageText }]
    setMessages(tempMessages)

    sendMessageWithHistory(`/userGuessesLeft-${maxUserGuesses-guesses.length} ${messageText}`)
      .then((response) => {
        setMessages([...tempMessages, {role: "bot" as const, message: response}])
      })
      .catch(err => console.log(err))
    
  }

  return (
    <div className="w-screen h-screen flex flex-col-reverse md:flex-row p-2 gap-2 md:p-12 md:gap-12">
      <div className="flex-grow w-full md:w-1/2 md:h-full border rounded-md p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-6 flex-grow overflow-scroll">
          {
            messages.map(({ message, role}: {message: string, role: "user"|"bot"}, index) => (
              message != "THIS IS AN AUTOMATED RESPONSE BY THE APPLICATION. THE USER HAS WON, REPLY LIKE YOU JUST REALIZED THAT THEY HAVE WON." &&
              <div key={index} className="flex flex-col shadow-sm rounded-md p-2 hover:shadow-md transition-all">
                <div className="text-xs">{role == "user" ? "You" : "Hangman-Tron"}</div>
                <div>{message.replace(/\/userGuess-[a-zA-Z0-9]+/g, "")}</div>
              </div>
            ))
          }
        </div>
        <div className="flex flex-row gap-2 h-fit">
          <textarea className="p-2 resize-none hover:resize-y flex w-full border rounded-md shadow-md" placeholder="enter your message..." value={inputValue} onChange={(e) => {setInputValue(e.target.value)}} onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              setInputValue("")
              sendMessage(inputValue)
            }
          }} />
          <button className="flex-grow p-2 border rounded-md text-sm shadow-md" onClick={() => {
            setInputValue("")
            sendMessage(inputValue)
          }}>Send</button>
        </div>
      </div>
      <div className="flex-grow w-full flex md:w-1/2 md:h-full flex-col border rounded-md justify-center items-center">
        <div>
          Guesses left: {maxUserGuesses - guesses.length}
        </div>
        <div className="flex flex-row gap-2 text-3xl w-fit h-fit">
          {
            randomWord.split("").map((randomWordCharacter, index) => (
              <div key={index}>
                {
                  guesses.includes(randomWordCharacter) ? randomWordCharacter : "_"
                }
              </div>
            ))
          }
        </div>
        {
          gameState == "won" && (
            <>
              <div className="text-4xl text-blue-500">You won!</div>
              <button onClick={() => {window.location.reload()}}>Play Again</button>
            </>
          )
        }
      </div>
    </div>
  )
}
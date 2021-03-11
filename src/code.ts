import { fromEvent } from 'rxjs'
import {
  bufferWhen,
  filter,
  map,
  groupBy,
  mergeMap,
  scan,
  share
} from 'rxjs/operators'

type wordEntry = [string, number]

const preElement = document.querySelector('#debug')

const isLetterKey = (event: KeyboardEvent) => event.code.startsWith('Key')
const shiftToUpper = (event: KeyboardEvent) =>
  event.shiftKey ? event.key.toUpperCase() : event.key
const nonEmptyArray = (arr: [string]) => arr.length > 0

// Key strokes mapped to letters.
const letters$ = fromEvent<KeyboardEvent>(window, 'keyup').pipe(
  share(),
  filter(isLetterKey),
  map(shiftToUpper)
)

// Anything that is not a letter.
const notLetters$ = fromEvent<KeyboardEvent>(window, 'keyup').pipe(
  filter((event) => event.key != 'Shift' && !event.code.startsWith('Key'))
)

// Keep a hashmap of word -> count.
const wordState = new Map<string, number>()

// Letters to words, split by non-letters.
const words$ = letters$.pipe(
  bufferWhen(() => notLetters$),
  filter(nonEmptyArray),
  map((letters) => letters.reduce((acc, s) => acc + s)),
  // Group words, ignoring casing.
  groupBy((word) => word.toLowerCase()),
  mergeMap((wordGroup$) =>
    wordGroup$.pipe(
      scan((acc: wordEntry, word) => [word.toLowerCase(), acc[1] + 1], ['', 0])
    )
  )
)

// Update the word counts.
words$.subscribe((entry: wordEntry) => {
  console.debug('updating', entry)
  wordState.set(entry[0], entry[1])
})

// Display the groups.
words$.subscribe(() => {
  console.debug('words', wordState)
  document.getElementById('output').innerHTML = Array.from(wordState)
    .sort()
    .sort((a, b) => b[1] - a[1])
    .map((entry) => `<li><div>${entry[0]}<span>${entry[1]}</span></div></li>`)
    .reduce((acc, liTag) => acc + liTag)
})

// Also display each letter when typing.
letters$.subscribe((letter) => (preElement.innerHTML += letter))

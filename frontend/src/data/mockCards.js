import { heroImages } from './heroImages'
import { realBoards } from './realBoards'

const MESSAGES = [
  'thank you for always making me laugh, even on the worst days',
  'the way you show up for people is genuinely inspiring',
  'this reminded me of that one sunday we spent walking around downtown',
  'you deserve every good thing coming your way',
  'still thinking about how you saved that dinner with a single joke',
  'grateful for your patience with me when i was completely spiraling',
  'the little notes you leave mean more than you know',
  'your playlist is the soundtrack of my summer, no exaggeration',
  'i love that we can sit in silence and it still feels warm',
  'you have a way of making ordinary moments feel special',
  'that late night talk changed how i think about a lot of things',
  'thank you for being so consistent when everything else was chaos',
  'proud of you doesn\'t even begin to cover it',
  'you\'re the reason i still believe in silly little joys',
]

const TITLES = [
  'a small thank you',
  'because of you',
  'that one time',
  'never forget',
  'this is for you',
  'quiet gratitude',
  'the best kind',
  'still smiling',
  'kept meaning to say',
  'love this',
]

const AUTHORS = ['anonymous', 'maya', 'jamie', 'sam', 'alex', null, null]

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateCardsForBoard(boardId, count) {
  return Array.from({ length: count }, (_, i) => ({
    id: `${boardId}-card-${i}`,
    boardId,
    title: pick(TITLES),
    message: pick(MESSAGES),
    gifUrl: pick(heroImages),
    author: pick(AUTHORS),
    upvotes: randomInt(0, 42),
    createdAt: new Date(2026, 5, randomInt(1, 28)).toISOString(),
  }))
}

export const mockCardsByBoard = Object.fromEntries(
  realBoards.map((board) => [
    board.id,
    generateCardsForBoard(board.id, randomInt(4, 9)),
  ]),
)

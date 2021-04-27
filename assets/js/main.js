const d = document,
    start = d.getElementById('start'),
    game = d.getElementById('game'),
    end = d.getElementById('end'),
    btnStart = d.getElementById('btn-start')

btnStart.addEventListener('click', () => {
    getQuestions()
})

const question = d.getElementById('question'),
    answersContent = d.getElementById('answers-container'),
    progressText = d.getElementById('progress-text'),
    scoreNumber = d.getElementById('score'),
    progressBar = d.getElementById('progress-bar')

let currentQuestion = {},
    acceptingAnswers = true,
    score = 0,
    questionCounter = 0,
    avaiilableQuestion = []

const SCORE_POINTS = 100
let MAX_QUESTIONS = 0

getCategories = () => {
    fetch('https://opentdb.com/api_category.php')
        .then(res => res.json())
        .then(data => renderCategories(data))
}

renderCategories = data => {
    const categories = d.getElementById('categories')

    let html = ''

    for (const cat of data.trivia_categories) {
        html += `<option value="${cat.id}">${cat.name}</option>`
    }

    categories.innerHTML += html
}

getCategories()

getQuestions = () => {
    const TOTAL_QUESTIONS = d.getElementById('totalQuestions').value,
        CATEGORIES = d.getElementById('categories').value,
        DIFFICULTY = d.getElementById('difficulty').value,
        TYPE = d.getElementById('type').value

    MAX_QUESTIONS = TOTAL_QUESTIONS

    fetch(`https://opentdb.com/api.php?amount=${TOTAL_QUESTIONS}&category=${CATEGORIES}&difficulty=${DIFFICULTY}&type=${TYPE}`)
        .then(res => res.json())
        .then(data => data.response_code === 1 ? alert('There are not enough questions according to your requirements.') : startGame(data.results))
}

startGame = questions => {
    questionCounter = 0
    score = 0
    avaiilableQuestion = [...questions]
    game.classList.remove('d-none')
    start.classList.add('d-none')
    getNewQuestion()
}


getNewQuestion = () => {
    if (avaiilableQuestion.length === 0 || questionCounter > MAX_QUESTIONS) {
        localStorage.setItem('mostRecentScore', score)

        game.classList.add('d-none')
        end.classList.remove('d-none')

        const username = d.getElementById('username'),
            saveScoreBtn = d.getElementById('saveScoreBtn'),
            finalScore = d.getElementById('finalScore'),
            mostRecentScore = localStorage.getItem('mostRecentScore')

        const highScores = JSON.parse(localStorage.getItem('highScores')) || []

        finalScore.innerHTML = mostRecentScore

        saveHighScore = e => {
            e.preventDefault()

            const score = {
                score: mostRecentScore,
                name: username.value
            }

            highScores.push(score)

            highScores.sort((a, b) => {
                return b.score - a.score
            })

            highScores.splice(10)

            localStorage.setItem('highScores', JSON.stringify(highScores))

            d.location.reload()
        }
    }

    questionCounter++
    progressText.innerText = `Question ${questionCounter} of ${MAX_QUESTIONS}`
    progressBar.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`

    const questionsIndex = avaiilableQuestion.length - 1
    currentQuestion = avaiilableQuestion[questionsIndex]
    question.innerHTML = currentQuestion.question


    const answers = []
    currentQuestion.incorrect_answers.forEach(answer => answers.push(answer))
    answers.push(currentQuestion.correct_answer)
    answers.sort(() => Math.random() - 0.5)


    let html = ''
    answers.forEach((answer, i) => {
        html += `
        <div class="form-check">
            <input class="custom-check-input" type="radio" name="exampleRadios" id="flexRadios${i}" value="${answer}">
            <label class="form-check-label" for="flexRadios${i}">
                ${answer}
            </label>
        </div>
        `
    })

    html += `<div class="d-none"><span>${currentQuestion.correct_answer}</span></div>`

    answersContent.innerHTML = html

    avaiilableQuestion.splice(questionsIndex, 1)
    acceptingAnswers = true
}

d.addEventListener('click', e => {
    if (e.target.matches('#answers-container .form-check input')) {
        if (!acceptingAnswers) return

        acceptingAnswers = false
        const selectChoise = e.target,
            selectAnswer = selectChoise.value,
            correctAnswer = d.querySelector('.d-none span').textContent

        let classToApply = selectAnswer == correctAnswer ? 'correct' : 'incorrect'

        if (classToApply === 'correct') {
            incrementScore(SCORE_POINTS)
        }

        selectChoise.parentElement.classList.add(classToApply)
        setTimeout(() => {
            selectChoise.parentElement.classList.remove(classToApply)
            getNewQuestion()
        }, 1000)
    }
})

incrementScore = num => {
    score += num
    scoreNumber.innerHTML = score
}

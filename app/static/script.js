const urlFetchAll = `http://127.0.0.1:5000/fetch?count=all`
const urlFetchRecent = `http://127.0.0.1:5000/fetch`
const audio = document.querySelector("#audio")
const alertBtn = document.querySelector(".notification-btn")
const pages = document.querySelector(".pages")
const colors = {
    PUSH: "#4CAF50",
    PULL_REQUEST: "#2196F3",
    MERGE: "#FFC107",
}

// states
let actions = []
let notificationState = false
const pageSize = 10

const fetchActions = async (page = 1) => {
    try {
        const url = `${urlFetchAll}&page=${page}`
        const response = await fetch(url)
        const data = await response.json()
        if (data.query == "all") {
            const count = data.count
            updatePaginationControls(page, count)
            actions = data.actions
            displayActions(actions)
        } else {
            actions = data.actions.splice(0, 10)
        }
    } catch (e) {
        console.log(e)
        alert("Error fetching GitHub Actions")
    }
}

function displayActions(actions) {
    const actionList = document.getElementById("action-list")
    actionList.innerHTML = ""

    actions.forEach((action) => {
        const actionItem = document.createElement("div")
        actionItem.classList.add("action-item")
        actionItem.style.borderLeft = `solid 5px ${colors[action.action]}`
        const title = document.createElement("h3")
        title.textContent = action.action
        actionItem.appendChild(title)

        const info = document.createElement("p")
        info.textContent = formatActionMessage(action)
        actionItem.appendChild(info)

        actionList.appendChild(actionItem)
    })
    if (notificationState) audio.play()
}

const formatActionMessage = (action) => {
    switch (action.action) {
        case "PUSH":
            return `${action.author} pushed to ${
                action.to_branch
            } on ${formatTime(action.timestamp)}`

        case "PULL_REQUEST":
            return `${action.author} submitted a pull request from ${
                action.from_branch
            } to ${action.to_branch} on ${formatTime(action.timestamp)}`
        case "MERGE":
            return `${action.author} merged branch ${action.from_branch} to ${
                action.to_branch
            } on ${formatTime(action.timestamp)}`
    }
}

alertBtn.addEventListener("click", () => {
    audio.play()
    if (notificationState) {
        alertBtn.textContent = "Turn On Notification"
        alertBtn.style.backgroundColor = "#218838"
        notificationState = false
    } else {
        alertBtn.textContent = "Turn Off Notification"
        alertBtn.style.backgroundColor = "#06601b"
        notificationState = true
    }
})

function updatePaginationControls(page, count) {
    const totalPages = Number.parseInt(count / pageSize + 1)
    const pageLinks = document.querySelector(".pages")
    pageLinks.innerHTML = ""

    const startPage = Math.max(1, page - 2)
    const endPage = Math.min(totalPages, page + 2)

    for (let i = startPage; i <= endPage; i++) {
        const pageLink = document.createElement("span")
        pageLink.classList.add("page-no")
        if (i === page) pageLink.classList.add("page-active")

        pageLink.textContent = i
        pageLink.addEventListener("click", () => fetchActions(i))
        pageLinks.appendChild(pageLink)
    }

    const prevBtn = document.getElementById("prev-btn")
    const nextBtn = document.getElementById("next-btn")

    prevBtn.disabled = page <= 1
    nextBtn.disabled = page >= totalPages

    prevBtn.onclick = () => fetchActions(page - 1)
    nextBtn.onclick = () => fetchActions(page + 1)
}

function formatTime(timestampUTC) {
    const date = new Date(timestampUTC)
    const getOrdinalSuffix = (day) => {
        if (day > 3 && day < 21) return "th"
        switch (day % 10) {
            case 1:
                return "st"
            case 2:
                return "nd"
            case 3:
                return "rd"
            default:
                return "th"
        }
    }

    const day = date.getUTCDate()
    const dayWithSuffix = day + getOrdinalSuffix(day)

    const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZone: "UTC",
    }

    const formattedDate = date.toLocaleString("en-US", options)
    return `${dayWithSuffix} April ${date.getUTCFullYear()} - ${
        formattedDate.split(", ")[1]
    } UTC`
}

// setInterval(() => fetchActions(urlFetchRecent), 15000)

fetchActions(1)

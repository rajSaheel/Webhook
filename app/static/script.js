const urlFetchAll = `http://127.0.0.1:5000/fetch?count=all`
const urlFetchRecent = `http://127.0.0.1:5000/fetch`
const list = document.querySelector("#action-list")
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
let currentPage = 1
let count = 0

const fetchActions = async (url) => {
    try {
        const response = await fetch(url)
        const data = await response.json()
        if (data.count > 0) {
            count += data.count
            updatePagination(count)
        }
        actions = data.actions
        newList = document.createElement("div")
        for (let action of actions) {
            const actionItem = document.createElement("div")
            actionItem.classList.add("action-item")
            const actionTitle = document.createElement("h3")
            actionTitle.textContent = action.action
            actionItem.appendChild(actionTitle)
            const actionInfo = document.createElement("p")
            actionInfo.textContent = getMessage(action)
            actionItem.appendChild(actionInfo)
            const actionId = document.createElement("p")
            actionId.textContent = `Request Id: ${action.request_id}`
            actionItem.appendChild(actionId)
            actionItem.style.borderLeft = `5px solid ${colors[action.action]}`
            newList.appendChild(actionItem)
        }
        list.innerHTML = newList.innerHTML + list.innerHTML
        if (notificationState) audio.play()
    } catch (e) {
        console.log(e)
        alert("Error fetching GitHub Actions")
    }
}

const getMessage = (action) => {
    switch (action.action) {
        case "PUSH":
            return `${action.author} pushed to ${
                action.to_branch
            } on ${new Date(action.timestamp).toLocaleString()}`

        case "PULL_REQUEST":
            return `${action.author} submitted a pull request from ${
                action.from_branch
            } to ${action.to_branch} on ${new Date(
                action.timestamp
            ).toLocaleString()}`
        case "MERGE":
            return `${action.author} merged branch ${action.from_branch} to ${
                action.to_branch
            } on ${new Date(action.timestamp).toLocaleString()}`
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

const updatePagination = (count) => {
    let totalPages = Number.parseInt(count / 10 + 1)
    pages.innerHTML = ""
    for (let i = 0; i < totalPages && i < 5; i++) {
        const page = document.createElement("span")
        page.classList.add("page-no")
        page.textContent = currentPage + i
        pages.appendChild(page)
    }
}

setInterval(() => fetchActions(urlFetchRecent), 15000)

fetchActions(urlFetchAll)

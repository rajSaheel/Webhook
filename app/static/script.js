const url = `http://127.0.0.1:5000/fetch`
const list = document.querySelector("#action-list")
const audio = document.querySelector("#audio")
const alertBtn = document.querySelector(".notification-btn")
const colors = {
    PUSH: "#4CAF50",
    PULL_REQUEST: "#2196F3",
    MERGE: "#FFC107",
}

let actions = []
let notificationState = false
const fetchActions = async () => {
    try {
        const response = await fetch(url)
        const data = await response.json()
        if (JSON.stringify(actions) != JSON.stringify(data.response)) {
            actions = data.response
            list.innerHTML = ""
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
                actionItem.style.borderLeft = `5px solid ${
                    colors[action.action]
                }`
                list.appendChild(actionItem)
            }
            if (notificationState) audio.play()
        }
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

setInterval(() => fetchActions(), 15000)

fetchActions()

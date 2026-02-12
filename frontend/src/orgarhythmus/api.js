

const API = "http://127.0.0.1:8000/api"

export async function fetch_project_teams(){
    const res = await fetch(`${API}/fetch_project_teams/`)
    const answer = await res.json()
    return answer
}






export async function safe_team_order( new_order ){
    const res = await fetch(`${API}/safe_team_order/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        }, 
        body: JSON.stringify({
            order: new_order
        })
    })
    const answer = res.json()
    return answer
}









export async function fetch_project_tasks(){
    const res = await fetch(`${API}/fetch_project_tasks/`)
    const answer = await res.json()
    return answer
}














const API = "http://127.0.0.1:8000/api"

export default async function fetch_project_teams(){
    console.log("CORRECTLY CALLED")

    const res = await fetch(`${API}/fetch_project_teams/`)
    const answer = await res.json()
    return answer
}







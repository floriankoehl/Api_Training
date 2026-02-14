

const API = "http://127.0.0.1:8000/api"



export async function fetch_project_details(){
    const res = await fetch(`${API}/get_project_details/`)
    const answer = await res.json()
    return answer
}




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



// Milestones 


export async function get_all_milestones(){
    const res = await fetch(`${API}/get_all_milestones/`)
    const answer = await res.json()
    return answer
}







export async function add_milestone(task_id) {
    const res = await fetch(`${API}/add_milestone/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }, 
        body: JSON.stringify({

            task_id: task_id
        })
    })
    const answer = await res.json()
    return answer
}



export async function update_start_index(milestone_id, index) {
    const res = await fetch(`${API}/update_start_index/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        }, 
        body: JSON.stringify({
            milestone_id: milestone_id,
            index: index
        })
    })
    const answer = await res.json()
    return answer
}



export async function delete_milestone(milestone_id){
    const res = await fetch(`${API}/delete_milestones/`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }, 
        body: JSON.stringify({
            id: milestone_id
        })
    })

    if (!res.ok) {
        const text = await res.text()   // backend might not send JSON on errors
        throw new Error(`Delete failed (${res.status}): ${text}`)
    }

    if (res.status === 204) return null

    return await res.json()
}






export async function change_duration(milestone_id, duration_change){
    const res = await fetch(`${API}/change_duration/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        }, 
        body: JSON.stringify({
            id: milestone_id,
            change: duration_change
        })
    })

    if (!res.ok) {
        const text = await res.text()   // backend might not send JSON on errors
        throw new Error(`UPDATE failed (${res.status}): ${text}`)
    }

     // if backend returns JSON (normal PATCH case)
    if (res.status === 200) {
        return await res.json()
    }

    // if you later switch to 204 No Content
    return null
}
const loginBtn=document.getElementById("loginBtn")
const form=document.getElementById("loginForm")


const Base_Url="http://localhost:3000/user"

form.addEventListener("submit",async(e)=>{
    e.preventDefault()

    try {
          const obj={
        email:e.target.email.value,
        password:e.target.password.value
    }

    form.reset()

    const response=await axios.post(`${Base_Url}/login`,obj)
    localStorage.setItem("token",response.data.token)

    alert(response.data.message)

    window.location.href="./chatUI.html"
    
    } catch (error) {
        alert(error.response.data.message)
    }
  
    
})
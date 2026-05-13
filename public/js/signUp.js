const signUpBtn=document.getElementById("signUpBtn")
const form=document.getElementById("signUpForm")


const Base_Url="http://localhost:3000/user"

form.addEventListener("submit",async(e)=>{
    e.preventDefault()
try {
       const obj={
        name:e.target.name.value,
        email:e.target.email.value,
        password:e.target.password.value
    }
console.log(obj)
    const response=await axios.post(`${Base_Url}/signup`,obj)
    const data=response.data
      alert(data.message)  
    form.reset()
} catch (error) {
    alert(error.response.data.message)
}
 
})
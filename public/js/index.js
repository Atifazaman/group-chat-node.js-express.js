const form=document.getElementById("signUpForm")
const BASE_URL="http://localhost:3000"

form.addEventListener("submit",async(e)=>{
    try{
    e.preventDefault()
    const obj={
        name:e.target.name.value,
        email:e.target.email.value,
        password:e.target.password.value
    }
    form.reset()
    const res=await axios.post(`${BASE_URL}/user/signup`,obj)

    alert(res.data.message || "User Created Successfully")
    }
    catch(err){
        alert(err.response?.data?.message || "Something Went Wrong")
    }
})
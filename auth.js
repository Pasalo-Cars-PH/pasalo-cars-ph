function login() {

    const role = document.getElementById("role").value;

    if(role === "buyer"){
        window.location.href="buyer.html";
    }

    if(role === "seller"){
        window.location.href="seller.html";
    }

    if(role === "agent"){
        window.location.href="agent.html";
    }

    if(role === "admin"){
        window.location.href="admin.html";
    }
}

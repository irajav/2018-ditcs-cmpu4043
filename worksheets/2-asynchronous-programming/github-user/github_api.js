   
    function get_user(username){
        
        let user_url = 'https://api.github.com/users/'+username;
        let repo_url = user_url+'/repos';
        
        //gets the github user
        fetch(user_url)
        .then(response => response.json())
        .then(data => {
            document.getElementById('username').innerHTML = data['login'];
            document.getElementById('name').innerHTML = data['name'];
            document.getElementById('pic').src = data['avatar_url'];
            if(data['email'] == null) data['email'] = "null";
            document.getElementById('email').innerHTML = data['email'];
            document.getElementById('location').innerHTML = data['location'];
            document.getElementById('gists').innerHTML = data['public_gists'];
            
            console.log(data) 
        })
        .catch(error => console.error(error))
        fetch(repo_url)
        .then(response => response.json())
        .then(data2 => {
            let repo_area= document.getElementById('userrepoframe');
                

        document.getElementById('reporow1').parentNode.removeChild(document.getElementById('reporow1'));
        document.getElementById('reporow2').parentNode.removeChild(document.getElementById('reporow2'));
        document.getElementById('reporow3').parentNode.removeChild(document.getElementById('reporow3'));
        document.getElementById('reporow4').parentNode.removeChild(document.getElementById('reporow4'));
        document.getElementById('reporow5').parentNode.removeChild(document.getElementById('reporow5'));
        document.getElementById('reporow6').parentNode.removeChild(document.getElementById('reporow6'));


            for(let i=0; i<data2.length; i++)
            {
                let index = i + 1;
                let element = document.createElement("div");
                element.classList +="reporow";
                element.id="reporow"+index;
                repo_area.appendChild(element);
                
                let text1 = document.createElement("div");
                let text2 = document.createElement("div");
                text1.classList.add("text");
                text2.classList.add("text");
                text1.id="name"+index;
                text2.id="desc"+index;
                element.appendChild(text1);
                element.appendChild(text2);

                if(data2[i]['description'])
                {
                    text1.innerHTML=data2[i]['name'];
                    text2.innerHTML=data2[i]['description'];
                }
                else
                {
                    text1.innerHTML=data2[i]['name'];
                    text2.innerHTML="No description";
                }
            }


        })
        .catch(error => console.error(error))
    }
    function look_up_data(){
        let inputName= document.getElementById('inputUser').value;
        if(inputName){
            get_user(inputName);
        }else{
            alert("Write something");
        }  
    }
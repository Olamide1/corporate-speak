const _BASE_URL =
window.location.host === "youreplied.com"
    ? "https://corporate-speak-b6a8f89a1523.herokuapp.com"
    : "http://localhost:3000";

document.addEventListener('DOMContentLoaded', () => {
    // Get all "navbar-burger" elements
    const navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
  
    // Check if there are any navbar burgers
    if (navbarBurgers.length > 0) {
      // Add a click event on each of them
      navbarBurgers.forEach(el => {
        el.addEventListener('click', () => {
          // Get the target from the "data-target" attribute
          const target = el.dataset.target;
          const $target = document.getElementById(target);
  
          // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
          el.classList.toggle('is-active');
          $target.classList.toggle('is-active');
        });
      });
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    // Get all "navbar-burger" elements
    const navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

    // Check if there are any navbar burgers
    if (navbarBurgers.length > 0) {
        // Add a click event on each of them
        navbarBurgers.forEach(el => {
            el.addEventListener('click', () => {
                // Get the target from the "data-target" attribute
                const target = el.dataset.target;
                const $target = document.getElementById(target);

                // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
                el.classList.toggle('is-active');
                $target.classList.toggle('is-active');
            });
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {

    const speechForm = document.getElementById("speechForm");
    const generatedSpeechPlaceholder = document.getElementById("generatedSpeechPlaceholder");

    const loremPlaceholder = document.getElementById("lorem");

    // Add an event listener to the form for submission
    speechForm.addEventListener("submit", function (e) {
        e?.preventDefault(); // Prevent the default form submission

        generatedSpeechPlaceholder.innerText = 'Writing your speech...'

        // Collect user input from form fields
        const message = document.getElementById("messageContent").value;
       
        sessionStorage.setItem('you_asked', message)
        // Make an API request to OpenAI with the updated headers
    fetch(`${_BASE_URL}/ask`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({
            message, 
            dfk: localStorage?.getItem('dfk') ?? sessionStorage?.getItem('dfk')
        }),
    })
    .then(response => response.json())
    .then(data => {
        // console.log('da', data);

        if (data.return) {
            // Display the generated speech in the placeholder
            generatedSpeechPlaceholder.innerText = data.say;

            loremPlaceholder.innerHTML = data.hide

            sessionStorage.setItem('you_replied', data.answer)
            try {
                localStorage.setItem('dfk', 'ladbudaru')
                sessionStorage.setItem('dfk', 'ladbudaru')
            } catch (error) {
                
            }

            // show the show full message button
            document.getElementsByName('pay-up')[0].style.display = 'block'
        } else {
            generatedSpeechPlaceholder.innerText = data.say;
        }
    })
    .catch(error => {
        console.error("Error:", error);

        generatedSpeechPlaceholder.innerText = 'Something failed. It\'s us, not you.'
    });
    });
});


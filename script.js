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
    const organizationId = 'org-2Q4dr0zQOQyr7qUTwCIhfd4W'; // Replace with your actual Organization ID


    // Add an event listener to the form for submission
    speechForm.addEventListener("submit", function (e) {
        e.preventDefault(); // Prevent the default form submission

        // Collect user input from form fields
        const message = document.getElementById("messageContent").value;
       
        // Prepare the data to send to the OpenAI API
        const inputData = {
            model: "gpt-3.5-turbo",
            messages: [
                {
                    "role": "user",
                    "content": `Transform the following unprofessional message into a professional, corporate-style communication suitable for email: ${message}. Please rewrite it to be formal, clear, and suitable for a professional email, ensuring that it maintains the original message's intent. In not more than 200 characters`,
                }
            ],
            max_tokens: 200, // Adjust the max tokens as needed
            temperature: 0.7, // Adjust the temperature for creativity
            n: 1, // Number of responses to generate
        };
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer <OPEN_AI_KEY>`, // Replace with your OpenAI API key
            'Openai-Organization': organizationId, // Include the Organization ID here
        };
        
        // Make an API request to OpenAI with the updated headers
        fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(inputData),
        })
        .then(response => response.json())
        .then(data => {
            // Display the generated speech in the placeholder
            const generatedSpeech = data.choices[0].message.content;
            generatedSpeechPlaceholder.innerText = generatedSpeech;
        })
        .catch(error => {
            console.error("Error:", error);
        });
    });
});

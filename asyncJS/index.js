// console.log("Hi...");

// setTimeout(()=>{
//  console.log("Step 1")
// }, 1000);

// setTimeout(()=>{
//  console.log("Step 2")
// }, 1000);

// console.log("Bye...");

//Promise Example

// function tossCoin(){
//     return new Promise((resolve, reject)=>{
//         const rand = Math.floor(Math.random()*2);
//         if(rand==1){
//             resolve("Heads");
//         } else {
//             reject("Tails");
//         }
//     })
// }

// let count = 1;

// console.log("Starting coin tosses...");

// setInterval(() => {

// tossCoin().then((result)=>{
//     console.log(count + ". You got: "+result);
// }).catch((error)=>{
//     console.log(count + ". You got: "+error);
// });

// count ++;

// }, 2000);

// function reachedHome(){
//     return new Promise((resolve, reject)=>{
//         let isReached = false;
//         if(isReached){
//             resolve();
//         }
//         else{
//             reject();
//         }
//     });
// }

// setTimeout(() => { 
// reachedHome().then(()=>{
//     console.log("I have reached home");
// }).catch(()=>{
//     console.log("I am still outside");
// });
// }, 3000);

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// function ticket() { 
//     return new Promise((resolve, reject)=>{
//         rl.question("Do you want to book the ticket? (yes/no): ", (answer) => {
//     let isTicketBooked = answer.toLowerCase() === 'yes';
//     if(isTicketBooked){
//         setTimeout(resolve, 2000, "Ticket booked");
//     } else{
//         reject("Ticket not booked");
//     }
// });
// });
// }

// async function bookTicket(){
//     try{
//         console.log("Booking ticket...");
//         const msg = await ticket();
//         console.log(msg);
//         console.log("Enjoy the show!");
//     } catch (error) {
//         console.log(error, "Please try again later.");
//     }
// }
// bookTicket();


//Exception Handling
function numValidation(){
    setTimeout(() => {
        rl.question("Enter a number: ", (num) => {
try{
        if(num === ''){
            throw "Empty input"
        }
        else if(isNaN(num)){
            throw "Not a number"
        } else {
            console.log("You entered: ", num);
        }
        console.log(num**2);
        
} catch (error) {
    console.log("Error Caught: ", error);
} finally {
    console.log("Execution completed.");
    rl.close();
}
});
    }, 1000);
  
}
numValidation();
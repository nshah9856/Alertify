 
require('es6-promise').polyfill();
require('isomorphic-fetch');


const dotenv = require("dotenv")
dotenv.load()

module.exports = exports = function getDirections(startAddress, finalAddress, to){
    var twilio = require('twilio');

    var client = new twilio(process.env.TWILIO_SID,process.env.TWILIO_AUTH); // TODO
    let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startAddress}&destination=${finalAddress}&key=${process.env.GOOGLEMAP_KEY}`
    async function sendTextMessage(to) {
        try {
        const data = await fetch(url)
        const out = await data.json()
        var d = "Directions FROM  " + startAddress + " TO " + finalAddress + ":\n"
        for (var i=1; i<=out.routes[0].legs[0].steps.length; i++){
            var StrippedString = out.routes[0].legs[0].steps[i-1].html_instructions.replace(/(<([^>]+)>)/ig,"");
            var StrippedString  = StrippedString.replace("&nbsp;","")
            d = d + i +". " + StrippedString + "\n"
        }

        await client.messages.create({
            to: to,
            from: process.env.TWILIO_NUMBER,
            body: `${d}`
        });
        console.log('Request sent');
        }  catch(error) {
            if (error.code === 21617){
                client.messages.create({
                    to: to,
                    from: process.env.TWILIO_NUMBER,
                    body: `Too much data to display in a text message requested, lower the count!`
                });
            }else{
                console.error(error)
            }
                }
    }
    sendTextMessage(to)
}

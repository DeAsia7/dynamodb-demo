const readline = require('readline-sync');
const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');

// to start a dynamodb client

const client = new DynamoDBClient({
    region: 'us-west-2'
});

// get user input
console.log('Login to access the system:');
const username = readline.question('Enter your username: '); // mallory
const password = readline.question('Enter your password: ', {hideEchoBack: true});

// check our Db to see if username and password exist and if they match

const params = { //get me the item from the table users with the username "mallory"
    TableName: 'users',
    key: {
        'username': {S: username} // S stand for string
    }
};

async function login () {
    try {
        //1. set up the command with the params 
const command = new GetItemCommand(params);

//2. send the client for the info using the command
const response = await client.send(command);

// 3. validate that the info *(user was found)
if (!Response.Item){
    console.log("User not found, Try again");
    return;
}

// 4. validate the password matches 
if (response.Item.password.S === password){
    // success
    console.log('Login successful');
} else {
    // incorrect password
    console.log('Incorrect password, Try again');
}
    } catch (error) {
        console.error("Error: ", error);
    }
};

login();
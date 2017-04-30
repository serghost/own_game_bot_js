TOKEN = require('./config/secrets.js');

var TelegramBot = require('node-telegram-bot-api');


// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(TOKEN, {polling: true});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});



var createCollection = function(db, collection, callback) {
    var collection = db.collection(collection);
};

var MongoClient = require('mongodb').MongoClient,
    co = require('co'),
    assert = require('assert');

co(function*() {
    // Connection URL
    const db = yield MongoClient.connect('mongodb://localhost:27017/own_game_bot');
    console.log("Connected correctly to server");
    console.log(db.listCollections());
    // Insert a single document
    var r = yield db.collection('inserts').insertOne({a:1});
    assert.equal(1, r.insertedCount);

    // Insert multiple documents
    var r = yield db.collection('inserts').insertMany([{a:2}, {a:3}]);
    assert.equal(2, r.insertedCount);

    let COLLECTION;
    bot.onText(/\/start/, (message) => {
        
        // Получив эту команду, бот должен сделать следующее:
        // Стереть старую коллекцию для чата, если она существует(?)
        // Создать новую коллекцию с именем чат_ид
        bot.sendMessage(message.chat.id, message.chat.id);
        bot.sendMessage(message.chat.id, "Здравствуйте, дамы и господа, с вами Петр Кулешов, в эфире 'Своя Игра'");
        COLLECTION = db.collection(String(message.chat.id));
        
    });

    bot.onText(/\/q (.+)/, (message, match) => {
        // Вызов коллбэка, который, по задумке, будет прерывать выполнение,
        // если не хватает каких-либо условий для начала игры.
        // Необходимые требования для начала игры:
        // Создание КОЛЛЕКЦИИ (таблицы) для данного чата
        // isGameStarted;
        
        const qMatches = match[1].match(/(.+); (.+) за (\d+)/);
        console.log(qMatches);
        if (qMatches && COLLECTION) {
            COLLECTION.insertOne({question: qMatches[1], topic: qMatches[2], value: qMatches[3]})  
            bot.sendMessage(message.chat.id, "Ok");
            //bot.sendMessage(message.chat.id, COLLECTION.find());
            console.log(COLLECTION.find());
        } else {
            bot.sendMessage(message.chat.id, "Начать игру - /start\nЧтобы задать вопрос, необходимо ввести команду /question <вопрос>; <тема> за <цена> \nНапример: \n /q Кто написал 'Войну и Мир'?; Писатели за 300");
        }
    });

    //bot.onText(/\/q (.+)/, (message, match) => {
  
    // Close connection
    db.close();
}).catch(function(err) {
    console.log(err.stack);
});


// Callbacks
// TODO: необходимо доработать ошибку в чате, если игра не была начата
// Здесь проверяется, создана ли коллекция
// Вообще пока неясно, как работать с такими ситуациями, ведь в памяти сервера хранится
// только одна переменная COLLECTION, когда, очевидно, что у нас может вестись
// параллельно множество игр.
let isGameStarted = function() {
    if (COLLECTION === undefined) {
        console.log("Нужно ввести /start, чтобы начать игру")
    };
};

const unregisterCommand = async (message, users, saveUserData) => {
    console.log('HI indside debug funciton');
    if (!users.has(message.author.id)) {
        message.channel.send("You haven't registered your Codeforces handle yet.");
        return;
    }

    users.delete(message.author.id);
    users.delete(`${message.author.id}_mashupHistory`);
    saveUserData();
    return message.reply('You have been unregistered, and all your data including mashup history has been removed.');
};

export default unregisterCommand;
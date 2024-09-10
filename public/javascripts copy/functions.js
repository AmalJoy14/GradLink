//function to sort the users such that, users who are not friends come first(Users who can be added)

function userSort(friendsList, existingUserList) {
    const existingFriends = [];
    const nonExistingFriends = [];

    friendsList[0].friends.forEach(friend => {
        const existingUser = existingUserList.find(user => user.username === friend);
        if (existingUser) {
            existingFriends.push(existingUser);
        } else {
            nonExistingFriends.push(friend);
        }
    });

    // Sort the existing user list
    existingUserList.sort((a, b) => {
        const aIndex = existingFriends.findIndex(friend => friend.username === a.username);
        const bIndex = existingFriends.findIndex(friend => friend.username === b.username);
        return aIndex - bIndex;
    });

    // Concatenate the arrays
    const sortedUserList = existingUserList.concat(nonExistingFriends.map(username => ({ username })));

    return sortedUserList;
}

/*************************************************************************************************************************************/

//Function to create room name for home chat

function createRoomName(username1, username2) {
    if (username1 < username2) {
        return `${username1}@${username2}`;
    } else {
        return `${username2}@${username1}`;
    }
}

/**************************************************************************************************************************************/

//Function to return page to render according to device type
function returnPage(deviceType){
    if (deviceType === 'phone') {
        return "_mobile.ejs";
    } else {
        return ".ejs";
    }
}


export { userSort ,createRoomName ,returnPage};
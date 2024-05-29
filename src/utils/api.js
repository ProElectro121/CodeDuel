export async function main(userHandles) {
    const userDetails = await fetchUserDetails(userHandles);
    return userDetails;
}

async function fetchUserDetails(handles) {
    try {
        // Construct the URL
        const url = `https://codeforces.com/api/user.info?handles=${handles}`;

        // Make the GET request
        const response = await fetch(url);

        // Check if the request was successful
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'OK') {
                return data.result;
            } else {
                console.error(`Error: ${data.comment}`);
                return null;
            }
        } else {
            console.error(`Failed to fetch data, status code: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error(`Failed to fetch data: ${error.message}`);
        return null;
    }
}
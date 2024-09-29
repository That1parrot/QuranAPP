document.getElementById('fetchVerseButton').addEventListener('click', function () {
    fetchVerse();
});

// Add event listener for the "Next Verse" button
document.getElementById('nextVerseButton').addEventListener('click', function () {
    goToNextVerse();
});

// Handle "Enter" key press to trigger the Find Verse button
document.getElementById('verseInput').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        document.getElementById('fetchVerseButton').click();
    }
});

async function fetchVerse() {
    let verseInput = document.getElementById('verseInput').value;
    const verseDisplay = document.getElementById('verseDisplay');

    verseDisplay.innerHTML = ''; // Clear any previous results

    // Replace all allowed separators with a colon ":"
    verseInput = verseInput.replace(/[ .;,/-]/g, ':'); // Replaces space, period, semicolon, etc., with a colon

    // Split the input to extract chapter and verse numbers
    const [chapter, verse] = verseInput.split(':');

    try {
        // Fetch the transliteration data from your local file
        const transliterationResponse = await fetch('./ara-quranphoneticst-la.json'); 
        const transliterationData = await transliterationResponse.json();

        // Fetch the Arabic text and translation from external API
        const arabicResponse = await fetch(`https://api.alquran.cloud/v1/ayah/${chapter}:${verse}`);
        const translationResponse = await fetch(`https://api.alquran.cloud/v1/ayah/${chapter}:${verse}/en.sahih`);

        const arabicData = await arabicResponse.json();
        const translationData = await translationResponse.json();

        // Find the corresponding transliteration from the JSON file
        const verseObject = transliterationData.quran.find(v => v.chapter == chapter && v.verse == verse);

        if (verseObject && arabicData.status === 'OK' && translationData.status === 'OK') {
            const arabicText = arabicData.data.text;
            const translation = translationData.data.text;
            const transliteration = verseObject.text;

            // Display the verse information
            verseDisplay.innerHTML = `
                <div><b>Arabic:</b> ${arabicText}</div>
                <div><b>Transliteration:</b> ${transliteration}</div>
                <div><b>Translation:</b> ${translation}</div>
            `;
        } else {
            verseDisplay.innerHTML = `<div>Verse not found. Please try again.</div>`;
        }
    } catch (error) {
        verseDisplay.innerHTML = `<div>Error fetching the verse. Please try again later.</div>`;
        console.error('Error fetching verse data:', error);
    }
}

async function goToNextVerse() {
    let verseInput = document.getElementById('verseInput').value;
    verseInput = verseInput.replace(/[ .;,/-]/g, ':'); // Replaces separators with a colon

    let [chapter, verse] = verseInput.split(':');

    chapter = parseInt(chapter);
    verse = parseInt(verse);

    try {
        // Fetch the chapter's details to know the total number of verses
        const chapterInfoResponse = await fetch(`https://api.alquran.cloud/v1/surah/${chapter}`);
        const chapterInfo = await chapterInfoResponse.json();
        const totalVerses = chapterInfo.data.ayahs.length;

        // Increment the verse, or move to the next chapter if it's the last verse
        if (verse < totalVerses) {
            verse++;
        } else {
            chapter++;
            verse = 1;  // Start at verse 1 of the new chapter
        }

        // Update the input field with the new chapter and verse
        document.getElementById('verseInput').value = `${chapter}:${verse}`;

        // Fetch the next verse automatically
        fetchVerse();
    } catch (error) {
        console.error('Error moving to next verse:', error);
    }
}

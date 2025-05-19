# Project Brief: Autocomplete Component

## Project Goal
Create a custom autocomplete UI component that suggests words as users type, using a provided API endpoint, with an interface inspired by iOS keyboard autocomplete.

## Core Requirements
1. Create an input field that displays autocomplete suggestions as the user types
2. Fetch suggestions from the API endpoint: `https://autocomplete-lyart.vercel.app/api/words`
3. Allow users to select suggestions (selection should console.log the chosen item)
4. Implement without relying on existing autocomplete libraries

## Technical Constraints
- Tech Stack: React, TypeScript, ShadCN UI
- API Parameters:
  - `query`: The search string to find matching words
  - `limit`: Maximum number of words to return (default: 5)

## Success Criteria
- Functional autocomplete with suggestions from the API
- Clean, intuitive user interface with good UX
- Performant fetching and display of results
- Proper error handling and edge cases
- Creative, thoughtful approach to the problem 
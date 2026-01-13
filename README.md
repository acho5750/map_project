# Hack-a-thing-1
## Author: Andrew Cho

## Project: Anonymity Location Sharing
Note: the project contains code written by AI
Git Repo: https://github.com/acho5750/map_project
Used: Mapbox GL, React

### Tutorials:
* https://www.youtube.com/watch?v=PBbi72XL6vY
* https://www.youtube.com/watch?v=aiw1F1mfeus&t=2480s
* LLMs also taught me

### Purpose: Users can decide how anonymous they want to be when sharing location
#### Functionality:
* With the provided slider, the user can set a specific radius through which a circle will appear of that size
* The Location of the user can be anywhere within the circle
* If the radius is 50m, a 50m radius sized circle will appear at a random center point. However, the user will still be located within the circle

### Additional Side Functionality:
* If the user doesn't want to share location, the user can select the checkbox to set the location to Baker Berry Library
* Heated Maps have been added around Dartmouth Frats

### How to install:
```bash
npm install
npm run dev
```
Note: Mapbox requires Token

### Project Structure

```
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── Map.jsx
│   ├── Map.css
│   ├── index.css
├── index.html 
├── vite.config.js 
├── package.json
├── .env (not in repo - create with VITE_MAPBOX_TOKEN)
├── .env.example
└── .gitignore
```


### Picture:

<img width="678" height="798" alt="Image" src="https://github.com/user-attachments/assets/84adfbc4-4dd8-45d9-82ce-9e2c272bd0e9" />





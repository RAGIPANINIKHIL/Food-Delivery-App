let restaurants = [];
let favrestaurants = [];
let interval;
let restaurantContainer = null;
let searchField = null;
let sortByField = null;
let tagByField = null;
let favField = null;

function init() {
  //Fetch data
  fetchDataFromAPI()
    .then((res) => {
      restaurants = res;
      filterRestaurants();
    })
    .catch((err) => {
      console.error(err);
    });

  restaurantContainer = document.querySelector(".restaurants");
  searchField = document.getElementById("restaurant");
  sortByField = document.getElementById("sortBy");
  tagByField = document.getElementById("tagBy");
  favField = document.getElementById("showFav");

  const f = debounce( filterRestaurants, 400 );

  bindEvent(searchField, "keyup", () => f('hi')  );
  bindEvent(sortByField, "change", filterRestaurants);
  bindEvent(tagByField, "change", filterRestaurants);
  bindEvent(favField, "change", filterRestaurants);

  bindEvent(restaurantContainer, "click", toggleFavorite);
}

function bindEvent(element, eventName, callback) {
  element.addEventListener(eventName, callback);
}

// Fetching Data from Api
function fetchDataFromAPI() {
  return fetch("./utility/sampledata.json")
    .then((res) => res.json())
    .catch((err) => {
      throw new Error(err);
    });
}

function filterRestaurants(x) {
  console.log(x);
  let searchedtext = searchField.value.toLowerCase();
  let tagvalue = tagByField.value;
  let sortvalue = sortByField.value;
  let favRestaurants = getFromLocalStorage('fav-res');

  let filteredrestaurants = restaurants.filter((res) => {

    if(favField.checked && favRestaurants.indexOf(res.id) == -1 ){
      return false;
    }

    if (res.name.toLowerCase().indexOf(searchedtext) == -1) {
      return false;
    }

    if (tagvalue.length > 0 && res.tags.indexOf(tagvalue) == -1) {
      return false;
    }

    return true;
  });

  filteredrestaurants.sort((a, b) => {
      if(sortvalue == 'name'){
        return a[sortvalue] < b[sortvalue] ? -1 : 0;
      } if(sortvalue == 'rating'){
         return a[sortvalue] > b[sortvalue] ? -1 : 0;
      }
  });

  generateView(filteredrestaurants, favRestaurants);
}

function generateView(filteredrestaurants, favRestaurants) {
  const cards = filteredrestaurants.map((res) => getCard(res, favRestaurants));

  restaurantContainer.innerHTML = cards.join("");
}

function getCard(restarunt, favRestaurants) {
  let card = `
        <div class="restaurants__card">
            <h3 class="restaurants__card_title"> ${restarunt.name} </h3>
            <h4 class="restaurants__card_rating"> Rating: ${restarunt.rating}  </h4>
            <h4 class="restaurants__card_eta"> ETA: ${restarunt.eta}  </h4>
            <p>
              <label for="restaurant__card_${restarunt.id}">Fav: </label>
              <input type="checkbox" name="restaurant__card_fav" id="fav_${restarunt.id}" data-id="${restarunt.id}" ${favRestaurants.indexOf(restarunt.id) != -1 ? "checked" : "" }/>
            </p>
        </div>
    `;

  return card;
}

function toggleFavorite(event) {
  if (event.target.name == "restaurant__card_fav") {
      
    let favRestaurants = getFromLocalStorage('fav-res');
    let resId = event.target.getAttribute("data-id");

    favResIndex = favRestaurants.indexOf(resId);

    if(event.target.checked){

      if(favResIndex == -1){
        favRestaurants.push(resId);
      }

    }else{
      favRestaurants.splice(favResIndex,1);
    }    

    addToLocalStorage('fav-res', favRestaurants);
  }
}

function debounce(callback, delay) {
    let interval;
    return (...args) => {
        if (interval){
         clearTimeout(interval);
        }
        interval = setTimeout(() => {
          callback(...args);
        }, delay); 
    }
}

function getFromLocalStorage(key) {
    if (localStorage.getItem(key) == null) {
      localStorage.setItem(key, "[]");
    }

    return JSON.parse(localStorage.getItem(key));
}

function addToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

init();

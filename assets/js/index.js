var map;

/*
var openCard = function () {
  // Open new hovering window
};*/

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 61.498151, lng: 23.761025},
    zoom: 8
  });

  /*
  (function initMapMenu() {
    // Main menu
    var menuDiv = document.createElement('div');

    var newsUI = document.createElement('img');
    newsUI.src = 'images/icons/Messaging-Appointment-Reminders-icon.png';
    menuDiv.appendChild(newsUI);

    var listUI = document.createElement('img');
    listUI.src = 'images/icons/Data-List-icon.png';
    menuDiv.appendChild(listUI);

    var addUI = document.createElement('img');
    addUI.src = 'images/icons/City-Hospital-icon.png';
    menuDiv.appendChild(addUI);

    var userUI = document.createElement('img');
    userUI.src = 'images/icons/Users-Name-icon.png';
    menuDiv.appendChild(userUI);

    map.controls[google.maps.ControlPosition.TOP_CENTER].push(menuDiv);

    addUI.addEventListener('click', function () {
      var m = new google.maps.Marker({
        position: map.getCenter(),
        title: 'New location',
        draggable: true,
        animation: google.maps.Animation.DROP
      });
      m.setMap(map);
    });
  }());*/
}

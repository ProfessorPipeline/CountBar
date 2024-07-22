/* global chrome */
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './style.css';

function App() {
  useEffect(() => {
    // Your existing JavaScript code here

    var birthday = new Date(1987, 11 - 1, 12, 12, 0, 0, 0);
    var deadline = 40;

    var ageSpan = document.getElementById("age"),
      restSpan = document.getElementById("rest"),
      progressDiv = document.getElementById("progress"),
      messageBox = document.getElementById("messageBox"),
      configBtn = document.getElementById("configBtn"),
      appsBtn = document.getElementById("appsBtn"),
      okBtn = document.getElementById("okBtn"),
      configBox = document.getElementById("configBox"),
      birthdayInput = document.getElementById("birthdayInput"),
      deadlineInput = document.getElementById("deadlineInput");

    function treatAsUTC(date) {
      var result = new Date(date);
      result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
      return result;
    }

    function daysBetween(startDate, endDate) {
      var millisecondsPerDay = 24 * 60 * 60 * 1000;
      return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
    }

    function drawValues() {
      var years = daysBetween(birthday, new Date()) / 365;
      var age = parseInt(years, 10);
      var rest = parseInt((years - age) * 10000000000, 10);

      ageSpan.innerHTML = age;
      restSpan.innerHTML = ". " + rest;
      progressDiv.style.width = (age / deadline * 554) + "px";

      setTimeout(drawValues, 100);
    }

    setTimeout(function () {
      messageBox.className = "hidden";
      setTimeout(function () { messageBox.parentNode.removeChild(messageBox); }, 1000); // remove after animation
    }, 100);

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.update) {
      appsBtn.addEventListener("click", function () {
        chrome.tabs.update({ url: "chrome://apps/" });
      });
    } else {
      console.warn('chrome.tabs.update is not available in this environment');
    }

    ////////////
    // CONFIG //
    ////////////

    // Show config screen
    function showConfigScreen() {
      birthdayInput.value = birthday.getFullYear() + "-" + ("0" + (birthday.getMonth() + 1)).slice(-2) + "-" + ("0" + birthday.getDate()).slice(-2);
      deadlineInput.value = deadline;
      configBox.style.display = "block";
    }

    configBtn.addEventListener("click", showConfigScreen);

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get("yddsBirthday", function (yb) {
        chrome.storage.sync.get("yddsDeadline", function (yd) {
          birthday = (yb.yddsBirthday ? new Date(yb.yddsBirthday) : birthday);
          deadline = (yd.yddsDeadline ? yd.yddsDeadline : deadline);
          drawValues(); // Draw values and start counting

          if (!yb.yddsBirthday || !yd.yddsDeadline) {
            showConfigScreen();
          }
        });
      });

      // Save configs
      okBtn.addEventListener("click", function () {
        console.log('OK button clicked');
        var newBirthday = new Date(Date.parse(birthdayInput.value + " 12:00:00")).getTime() || birthday.getTime();
        var newDeadline = parseInt(deadlineInput.value, 10) || 40;

        console.log('New Birthday:', newBirthday);
        console.log('New Deadline:', newDeadline);

        chrome.storage.sync.set({ "yddsBirthday": newBirthday, "yddsDeadline": newDeadline }, function () {
          console.log('Storage updated');
          window.location.reload(true);
        });
      });
    } else {
      console.warn('chrome.storage.sync is not available in this environment');

      // Fallback logic if chrome.storage.sync is not available
      okBtn.addEventListener("click", function () {
        console.log('OK button clicked (fallback)');
        var newBirthday = new Date(Date.parse(birthdayInput.value + " 12:00:00")).getTime() || birthday.getTime();
        var newDeadline = parseInt(deadlineInput.value, 10) || 40;

        console.log('New Birthday:', newBirthday);
        console.log('New Deadline:', newDeadline);

        // Save to localStorage as fallback
        localStorage.setItem("yddsBirthday", newBirthday);
        localStorage.setItem("yddsDeadline", newDeadline);
        window.location.reload(true);
      });

      // Load from localStorage as fallback
      var yddsBirthday = localStorage.getItem("yddsBirthday");
      var yddsDeadline = localStorage.getItem("yddsDeadline");
      birthday = (yddsBirthday ? new Date(parseInt(yddsBirthday)) : birthday);
      deadline = (yddsDeadline ? parseInt(yddsDeadline) : deadline);
      drawValues(); // Draw values and start counting

      if (!yddsBirthday || !yddsDeadline) {
        showConfigScreen();
      }
    }
  }, []);

  return null;
}

ReactDOM.render(<App />, document.getElementById('root'));

document.addEventListener('DOMContentLoaded', function() {
  var table = new DataTable('#example');
  loadSensors();

  window.addSensor = function() {
      var sensorInput = document.getElementById('sensorInput').value;
      var descriptionInput = document.getElementById('descriptionInput').value;
      var statusInput = document.getElementById('statusInput').value;

      // Clear the input fields after getting their values
      document.getElementById('sensorInput').value = '';
      document.getElementById('descriptionInput').value = '';
      document.getElementById('statusInput').value = 'Active';

      // Add the new row to the DataTable
      var sensorId = new Date().getTime(); // Generate a unique ID for the sensor
      var newRow = table.row.add([
          sensorInput,
          descriptionInput,
          getStatusBadge(statusInput),
          '<button class="btn btn-danger" onclick="deleteSensor(this)">Delete</button> <button class="btn btn-warning" onclick="editSensorModal(this)">Edit</button>'
      ]).draw().node();

      // Save the sensor data to localStorage
      saveSensor(sensorId, sensorInput, descriptionInput, statusInput);

      // Close the modal
      var modalElement = document.getElementById('addSensorModal');
      var modal = bootstrap.Modal.getInstance(modalElement);
      modal.hide();
  };

  window.editSensorModal = function(button) {
    var row = button.closest('tr');
    var sensorData = table.row(row).data();

    // Display the modal for editing
    var modalElement = document.getElementById('editSensorModal');
    var modal = new bootstrap.Modal(modalElement);
    modal.show();

    // Set the input values for editing
    document.getElementById('editSensorInput').value = sensorData[0];
    document.getElementById('editDescriptionInput').value = sensorData[1];
    document.getElementById('editStatusInput').value = sensorData[2]; // Ensure this matches the actual value stored in DataTable

    // Update the save button to handle editing
    document.querySelector('#editSensorModal .modal-footer .btn-primary').onclick = function() {
        var updatedSensorInput = document.getElementById('editSensorInput').value;
        var updatedDescriptionInput = document.getElementById('editDescriptionInput').value;
        var updatedStatusInput = document.getElementById('editStatusInput').value;

        // Update the row in the DataTable
        table.row(row).data([
            updatedSensorInput,
            updatedDescriptionInput,
            getStatusBadge(updatedStatusInput), // Call getStatusBadge to get the badge HTML based on the updated status
            '<button class="btn btn-danger" onclick="deleteSensor(this)">Delete</button> <button class="btn btn-warning" onclick="editSensorModal(this)">Edit</button>'
        ]).draw();

        // Save the updated sensor data to localStorage
        updateSensor(getSensorId(sensorData), updatedSensorInput, updatedDescriptionInput, updatedStatusInput);

        // Close the modal
        modal.hide();
    };
};



  window.deleteSensor = function(button) {
      var row = button.closest('tr');
      var sensorData = table.row(row).data();

      // Remove the row from the DataTable
      table.row(row).remove().draw();

      // Update localStorage
      removeSensor(getSensorId(sensorData));
  };

  function saveSensor(id, sensor, description, status) {
      var sensors = JSON.parse(localStorage.getItem('sensors')) || [];
      sensors.push({ id, sensor, description, status });
      localStorage.setItem('sensors', JSON.stringify(sensors));
  }

  function updateSensor(id, sensor, description, status) {
      var sensors = JSON.parse(localStorage.getItem('sensors')) || [];
      var index = sensors.findIndex(sensor => sensor.id === id);
      if (index !== -1) {
          sensors[index] = { id, sensor, description, status };
          localStorage.setItem('sensors', JSON.stringify(sensors));
      }
  }

  function removeSensor(id) {
      var sensors = JSON.parse(localStorage.getItem('sensors')) || [];
      var index = sensors.findIndex(sensor => sensor.id === id);
      if (index !== -1) {
          sensors.splice(index, 1);
          localStorage.setItem('sensors', JSON.stringify(sensors));
      }
  }

  function loadSensors() {
      var sensors = JSON.parse(localStorage.getItem('sensors')) || [];
      sensors.forEach(function(sensor) {
          table.row.add([
              sensor.sensor,
              sensor.description,
              getStatusBadge(sensor.status),
              '<button class="btn btn-danger" onclick="deleteSensor(this)">Delete</button> <button class="btn btn-warning" onclick="editSensorModal(this)">Edit</button>'
          ]).draw().node();
      });
  }

  function getSensorId(sensorData) {
      var sensors = JSON.parse(localStorage.getItem('sensors')) || [];
      var sensor = sensors.find(sensor => sensor.sensor === sensorData[0] && sensor.description === sensorData[1] && sensor.status === sensorData[2]);
      return sensor ? sensor.id : null;
  }

  function getStatusBadge(status) {
      var badgeClass = status.toLowerCase() === 'active' ? 'status-badge active' : 'status-badge inactive';
      return `<span class="${badgeClass}">${status}</span>`;
  }
});

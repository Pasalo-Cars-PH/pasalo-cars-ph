let vehicles = [];

fetch("../data/vehicles.json")
.then(res => res.json())
.then(data => {
    vehicles = data;
    displayVehicles(data);
});

function displayVehicles(data){

    const container =
    document.getElementById("vehicle-list");

    container.innerHTML = "";

    data.forEach(vehicle => {

container.innerHTML += `
<div class="card">
    <h3>🚗 ${vehicle.brand} ${vehicle.model}</h3>

    <p>📅 Year: ${vehicle.year}</p>

    <p>💳 Monthly: ₱${vehicle.monthly.toLocaleString()}</p>

    <p>✅ Status: ${vehicle.status}</p>

    <button class="view-btn">
        View Details
    </button>
</div>
`;
    });
}

function filterVehicles(){

    const keyword =
    document.getElementById("search")
    .value
    .toLowerCase();

    const filtered =
    vehicles.filter(v =>
      v.brand.toLowerCase().includes(keyword)
    );

    displayVehicles(filtered);
}

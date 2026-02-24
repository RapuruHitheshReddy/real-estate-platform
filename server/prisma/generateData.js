const fs = require("fs");
const path = require("path");

/* ------------------------------------------------ */
/* CONFIG */
/* ------------------------------------------------ */

const TOTAL_MANAGERS = 25;
const TOTAL_LOCATIONS = 100;
const TOTAL_PROPERTIES = 100;
const TOTAL_TENANTS = 40;

const cities = [
  { city: "New York", state: "NY", lng: -73.985428, lat: 40.748817 },
  { city: "Los Angeles", state: "CA", lng: -118.243683, lat: 34.052235 },
  { city: "Chicago", state: "IL", lng: -87.629799, lat: 41.878113 },
  { city: "Miami", state: "FL", lng: -80.19179, lat: 25.761681 },
  { city: "Seattle", state: "WA", lng: -122.332071, lat: 47.606209 },
  { city: "Austin", state: "TX", lng: -97.743057, lat: 30.267153 },
  { city: "Boston", state: "MA", lng: -71.058884, lat: 42.360082 },
  { city: "Denver", state: "CO", lng: -104.990251, lat: 39.739235 },
];

/* ------------------------------------------------ */
/* HELPERS */
/* ------------------------------------------------ */

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function subset(arr, max) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, rand(1, max));
}

function jitter(value, range = 0.03) {
  return value + (Math.random() - 0.5) * range;
}

/* ------------------------------------------------ */
/* ENUM VALUES (match Prisma schema exactly) */
/* ------------------------------------------------ */

const propertyTypes = [
  "Rooms",
  "Tinyhouse",
  "Apartment",
  "Villa",
  "Townhouse",
  "Cottage",
];

const amenities = [
  "WasherDryer",
  "AirConditioning",
  "Dishwasher",
  "HighSpeedInternet",
  "HardwoodFloors",
  "WalkInClosets",
  "Microwave",
  "Refrigerator",
  "Pool",
  "Gym",
  "Parking",
  "PetsAllowed",
  "WiFi",
];

const highlights = [
  "HighSpeedInternetAccess",
  "WasherDryer",
  "AirConditioning",
  "Heating",
  "SmokeFree",
  "CableReady",
  "SatelliteTV",
  "DoubleVanities",
  "TubShower",
  "Intercom",
  "SprinklerSystem",
  "RecentlyRenovated",
  "CloseToTransit",
  "GreatView",
  "QuietNeighborhood",
];

/* ------------------------------------------------ */
/* MANAGERS */
/* ------------------------------------------------ */

function generateManagers() {
  const managers = [];

  for (let i = 1; i <= TOTAL_MANAGERS; i++) {
    managers.push({
      id: i,
      cognitoId: `us-east-1:manager-${String(i).padStart(4, "0")}`,
      name: `Manager ${i}`,
      email: `manager${i}@estate.com`,
      phoneNumber: `+1 (555) ${rand(200, 999)}-${rand(1000, 9999)}`,
    });
  }

  return managers;
}

/* ------------------------------------------------ */
/* LOCATIONS */
/* ------------------------------------------------ */

function generateLocations() {
  const locations = [];

  for (let i = 1; i <= TOTAL_LOCATIONS; i++) {
    const city = random(cities);

    const lng = jitter(city.lng, 0.12);
    const lat = jitter(city.lat, 0.12);

    locations.push({
      id: i,
      country: "United States",
      city: city.city,
      state: city.state,
      address: `${rand(100, 9999)} Main St`,
      postalCode: `${rand(10000, 99999)}`,
      coordinates: `POINT(${lng} ${lat})`,
    });
  }

  return locations;
}

/* ------------------------------------------------ */
/* PROPERTIES */
/* ------------------------------------------------ */

function generateProperties(managers) {
  const properties = [];

  for (let i = 1; i <= TOTAL_PROPERTIES; i++) {
    const manager = random(managers);

    const price = rand(900, 6000);

    properties.push({
      id: i,
      name: `Modern Residence #${i}`,
      description:
        "Beautiful rental property located in a vibrant neighborhood with easy access to transit, dining, and parks.",

      pricePerMonth: price,
      securityDeposit: price,
      applicationFee: rand(30, 100),

      photoUrls: [
        `https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&q=80&sig=${i}`,
        `https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80&sig=${i}`,
      ],

      amenities: subset(amenities, 5),
      highlights: subset(highlights, 3),

      isPetsAllowed: Math.random() > 0.4,
      isParkingIncluded: Math.random() > 0.5,

      beds: rand(1, 4),
      baths: Number((1 + Math.random() * 2).toFixed(1)),
      squareFeet: rand(500, 2500),

      propertyType: random(propertyTypes),

      postedDate: new Date().toISOString(),
      averageRating: Number((3 + Math.random() * 2).toFixed(1)),
      numberOfReviews: rand(0, 200),

      locationId: i,
      managerCognitoId: manager.cognitoId,
    });
  }

  return properties;
}

/* ------------------------------------------------ */
/* TENANTS */
/* ------------------------------------------------ */

function generateTenants() {
  const tenants = [];

  for (let i = 1; i <= TOTAL_TENANTS; i++) {
    tenants.push({
      id: i,
      cognitoId: `us-east-1:tenant-${String(i).padStart(4, "0")}`,
      name: `Tenant ${i}`,
      email: `tenant${i}@mail.com`,
      phoneNumber: `+1 (555) ${rand(200, 999)}-${rand(1000, 9999)}`,
    });
  }

  return tenants;
}

/* ------------------------------------------------ */
/* LEASES */
/* ------------------------------------------------ */

function generateLeases(properties, tenants) {
  const leases = [];

  let id = 1;

  properties.slice(0, 30).forEach((property) => {
    const tenant = random(tenants);

    const rent = property.pricePerMonth;

    leases.push({
      id: id++,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 31536000000).toISOString(),
      rent,
      deposit: rent,
      propertyId: property.id,
      tenantCognitoId: tenant.cognitoId,
    });
  });

  return leases;
}

/* ------------------------------------------------ */
/* APPLICATIONS */
/* ------------------------------------------------ */

function generateApplications(properties, tenants) {
  const apps = [];

  for (let i = 1; i <= 40; i++) {
    const tenant = random(tenants);
    const property = random(properties);

    apps.push({
      id: i,
      applicationDate: new Date().toISOString(),
      status: random(["Pending", "Approved", "Denied"]),
      propertyId: property.id,
      tenantCognitoId: tenant.cognitoId,
      name: tenant.name,
      email: tenant.email,
      phoneNumber: tenant.phoneNumber,
      message: "Interested in renting this property.",
    });
  }

  return apps;
}

/* ------------------------------------------------ */
/* PAYMENTS */
/* ------------------------------------------------ */

function generatePayments(leases) {
  const payments = [];

  let id = 1;

  leases.forEach((lease) => {
    for (let i = 0; i < 4; i++) {
      payments.push({
        id: id++,
        amountDue: lease.rent,
        amountPaid: lease.rent,
        dueDate: new Date().toISOString(),
        paymentDate: new Date().toISOString(),
        paymentStatus: "Paid",
        leaseId: lease.id,
      });
    }
  });

  return payments;
}

/* ------------------------------------------------ */
/* RUN */
/* ------------------------------------------------ */

const managers = generateManagers();
const locations = generateLocations();
const properties = generateProperties(managers);
const tenants = generateTenants();
const leases = generateLeases(properties, tenants);
const applications = generateApplications(properties, tenants);
const payments = generatePayments(leases);

const seedDir = path.join(__dirname, "seedData");

fs.writeFileSync(
  path.join(seedDir, "manager.json"),
  JSON.stringify(managers, null, 2)
);

fs.writeFileSync(
  path.join(seedDir, "location.json"),
  JSON.stringify(locations, null, 2)
);

fs.writeFileSync(
  path.join(seedDir, "property.json"),
  JSON.stringify(properties, null, 2)
);

fs.writeFileSync(
  path.join(seedDir, "tenant.json"),
  JSON.stringify(tenants, null, 2)
);

fs.writeFileSync(
  path.join(seedDir, "lease.json"),
  JSON.stringify(leases, null, 2)
);

fs.writeFileSync(
  path.join(seedDir, "application.json"),
  JSON.stringify(applications, null, 2)
);

fs.writeFileSync(
  path.join(seedDir, "payment.json"),
  JSON.stringify(payments, null, 2)
);

console.log("Seed data generated successfully.");
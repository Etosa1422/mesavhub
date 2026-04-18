import api from "./api";

/**
 * Virtual Numbers API service
 *
 * Backend endpoints (all under /api/):
 *   GET    virtual-numbers/services?country_code=US  — real services + prices from provider
 *   GET    virtual-numbers/rentals                   — list authenticated user's rentals
 *   POST   virtual-numbers/rent                      — provision + rent a number
 *   GET    virtual-numbers/rentals/{id}              — single rental (poll for OTP)
 *   DELETE virtual-numbers/rentals/{id}              — cancel & release number
 *   POST   virtual-numbers/webhook                   — Twilio incoming-SMS webhook (no auth)
 */

export const getServicesForCountry = (countryCode) =>
  api.get(`/virtual-numbers/services?country_code=${countryCode}`);

export const getAvailableCountries = () =>
  api.get("/virtual-numbers/countries");

export const getMyRentals = () =>
  api.get("/virtual-numbers/rentals");

export const rentNumber = (data) =>
  api.post("/virtual-numbers/rent", data);
// data: { country_code, country_name, country_flag, country_dial, service, price }

export const getRental = (id) =>
  api.get(`/virtual-numbers/rentals/${id}`);

export const cancelRental = (id) =>
  api.delete(`/virtual-numbers/rentals/${id}`);

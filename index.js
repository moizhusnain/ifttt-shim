// Get express and fetch
const express = require("express");
const fetch = require("node-fetch");

// Create new express object
const app = new express();

// Parse json body
app.use(express.json());

// Service key
const serviceKey = "RfCPQUydzIZbOGhVeWGX0NNdA67Zma92autVThjSCqLTH4_wyF4QtRnqiQiA7u1n";

// Core route
app.get("/", (req, res) => {
    // Say hello
    res.json({ code: "GRANDEUR-IFTTT-SAYS-HELLO", message: `Version ${process.env.npm_package_version}` });
});

// Default middleware to validate that the request is valid
app.use((req, res, next) => {
	// Check header and return 401 if verfication failed
    // We will return error in default IFTTT format
	if (req.headers["ifttt-service-key"] != serviceKey) return res.status(401).json({
		errors: [{
			message: "Invalid service key"
		}]
	});

	// Go to next route if success
	next();
})

// We will return a sample config
app.post("/ifttt/v1/test/setup", (req, res) => {
    // Required by IFTTT to test connection
	// Send response
	res.json({
		data: {
			samples: {
				actions: {
					set_data: {
						variable: "status",
						deviceID: "deviceID",
						token: "token",
						apiKey: "apiKey"
					}
				}
			}
		}
	});
})

// API status route
app.get("/ifttt/v1/status", (req, res) => {
	// Return 200
	res.json({ code: "GRANDEUR-IFTTT-SAYS-HELLO", message: `Version ${process.env.npm_package_version}` });
});

// Set device data route
app.post("/ifttt/v1/actions/set_data", async (req, res) => {
	// Get fields
	var fields = req.body.actionFields;

	// Validate that action fields were provided
	if (!fields) return res.status(400).json({
		errors: [{
			message: "Invalid data"
		}]
	});

	// Validate data
	if (!fields.variable || !fields.deviceID || !fields.apiKey || !fields.token) return res.status(400).json({
		errors: [{
			message: "Invalid data"
		}]
	});

    // Print log
    console.log("Resolving: ", fields);

	// Proxy the request to server
	var response = await fetch(`https://api.grandeur.tech/device/data/set?apiKey=${fields.apiKey}`, {
        // Going to be a post request
		method: "post",

        // Add token to request
		headers: {
			"authorization": fields.token,
			"Content-Type": "application/json"
		},

        // And pass data
		body: JSON.stringify({
			deviceID: fields.deviceID,
			path: fields.variable,
			data: fields.value
		})
	});

    // Convert response to json
	response = await response.json();

    // Log response
    console.log("Response: ", response);

	// Return response
	res.json({
		data: [{
			id: 1234
		}]
	});
})

// Start server
app.listen(3000, () => console.log("Started IFTTT shim"));
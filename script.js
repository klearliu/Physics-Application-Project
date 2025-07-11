document.addEventListener("DOMContentLoaded", function () {
  const projectileModeCheckbox = document.getElementById("projectile-mode");
  const projectileInputsContainer = document.getElementById(
    "projectile-inputs-container"
  );
  const constantVelocityCheckbox = document.getElementById("constant-velocity");
  const initialVelocityInput = document.getElementById("initial-velocity");
  const finalVelocityInput = document.getElementById("final-velocity");
  const accelerationInput = document.getElementById("acceleration");
  const timeInput = document.getElementById("time");
  const displacementInput = document.getElementById("displacement");
  const initialHeightInput = document.getElementById("initial-height");
  const launchAngleInput = document.getElementById("launch-angle");
  const calculateButton = document.getElementById("calculate-btn");
  // Removed resetButton constant as the button is removed from HTML

  const solution2Container = document.getElementById("solution-2-container");
  const resultsGrid = document.getElementById("results-grid");

  const accelerationLabel = document.getElementById("acceleration-label");
  const constantVelocityControlRow = document.getElementById(
    "constant-velocity-control-row"
  );

  // References to Solution 1 output rows for projectile motion
  const solution1GRow = document.getElementById("output-g-1-row");
  const solution1HeightRow = document.getElementById("output-h-1-row");
  const solution1AngleRow = document.getElementById("output-angle-1-row");
  const solution1RangeRow = document.getElementById("output-range-1-row");
  const solution1MaxHeightRow = document.getElementById(
    "output-max-height-1-row"
  );
  const solution1FlightTimeRow = document.getElementById(
    "output-flight-time-1-row"
  );

  // References to Solution 1 output rows for both modes (V0 and Vf are common)
  const solution1V0Row = document.getElementById("output-v0-1-row");
  const solution1VfRow = document.getElementById("output-vf-1-row");

  // References to Solution 1 output rows for kinematic motion
  const solution1ARow = document.getElementById("output-a-1-row");
  const solution1TRow = document.getElementById("output-t-1-row");
  const solution1DRow = document.getElementById("output-d-1-row");

  // References to ALL Solution 2 output rows
  const solution2V0Row = document.getElementById("output-v0-2-row");
  const solution2VfRow = document.getElementById("output-vf-2-row");
  const solution2GRow = document.getElementById("output-g-2-row");
  const solution2TimeRow = document.getElementById("output-time-2-row");
  const solution2RangeRow = document.getElementById("output-range-2-row");
  const solution2MaxHeightRow = document.getElementById(
    "output-max-height-2-row"
  );
  const solution2HRow = document.getElementById("output-h-2-row");
  const solution2AngleRow = document.getElementById("output-angle-2-row");

  // Array of all relevant input elements
  const allInputElements = [
    initialVelocityInput,
    finalVelocityInput,
    accelerationInput,
    timeInput,
    displacementInput,
    initialHeightInput,
    launchAngleInput,
  ];

  // Function to update the calculate button state based on filled inputs
  function updateCalculateButtonState() {
    let filledInputsCount = 0;

    if (projectileModeCheckbox.checked) {
      // Projectile Mode Logic
      const projectileInputs = [
        initialVelocityInput,
        initialHeightInput,
        launchAngleInput,
        timeInput,
        displacementInput,
      ];

      if (
        accelerationInput.value !== "" &&
        parseFloat(accelerationInput.value) !== -9.81
      ) {
        filledInputsCount++;
      }

      projectileInputs.forEach((input) => {
        if (input && input.value !== "") {
          filledInputsCount++;
        }
      });

      const initialConditionsMet =
        initialVelocityInput.value !== "" &&
        initialHeightInput.value !== "" &&
        launchAngleInput.value !== "";

      const totalProjectileInputsFilled = [
        initialVelocityInput,
        initialHeightInput,
        launchAngleInput,
        timeInput,
        displacementInput,
      ].filter((input) => input.value !== "").length;

      if (
        accelerationInput.value !== "" &&
        parseFloat(accelerationInput.value) !== -9.81
      ) {
        totalProjectileInputsFilled++;
      }

      if (initialConditionsMet || totalProjectileInputsFilled >= 3) {
        calculateButton.disabled = false;
        calculateButton.classList.remove("bg-gray-400");
        calculateButton.classList.add("bg-green-600", "hover:bg-green-700");
      } else {
        calculateButton.disabled = true;
        calculateButton.classList.add("bg-gray-400");
        calculateButton.classList.remove("bg-green-600", "hover:bg-green-700");
      }
    } else {
      // Kinematic Mode Logic
      const kinematicInputs = [
        initialVelocityInput,
        finalVelocityInput,
        accelerationInput,
        timeInput,
        displacementInput,
      ];

      kinematicInputs.forEach((input) => {
        if (input && input.value !== "" && !input.disabled) {
          filledInputsCount++;
        }
      });

      if (constantVelocityCheckbox.checked) {
        const isInitialVelocityFilled = initialVelocityInput.value !== "";
        const isTimeOrDisplacementFilled =
          timeInput.value !== "" || displacementInput.value !== "";

        if (isInitialVelocityFilled && isTimeOrDisplacementFilled) {
          calculateButton.disabled = false;
          calculateButton.classList.remove("bg-gray-400");
          calculateButton.classList.add("bg-green-600", "hover:bg-green-700");
        } else {
          calculateButton.disabled = true;
          calculateButton.classList.add("bg-gray-400");
          calculateButton.classList.remove(
            "bg-green-600",
            "hover:bg-green-700"
          );
        }
      } else {
        const requiredKinematicInputs = 3;
        if (filledInputsCount >= requiredKinematicInputs) {
          calculateButton.disabled = false;
          calculateButton.classList.remove("bg-gray-400");
          calculateButton.classList.add("bg-green-600", "hover:bg-green-700");
        } else {
          calculateButton.disabled = true;
          calculateButton.classList.add("bg-gray-400");
          calculateButton.classList.remove(
            "bg-green-600",
            "hover:bg-green-700"
          );
        }
      }
    }
  }

  // Function to apply/reset constant velocity state
  function applyConstantVelocityState() {
    if (constantVelocityCheckbox.checked) {
      accelerationInput.value = "0";
      accelerationInput.disabled = true;
      accelerationInput.classList.add("bg-gray-200");

      finalVelocityInput.value = initialVelocityInput.value;
      finalVelocityInput.disabled = true;
      finalVelocityInput.classList.add("bg-gray-200");
    } else {
      if (!projectileModeCheckbox.checked) {
        // Only re-enable if not in projectile mode
        accelerationInput.value = "";
        accelerationInput.disabled = false;
        accelerationInput.classList.remove("bg-gray-200");
      }
      finalVelocityInput.value = "";
      finalVelocityInput.disabled = false;
      finalVelocityInput.classList.remove("bg-gray-200");
    }
    updateCalculateButtonState();
  }

  // Function to update the visibility of solution containers and specific fields in Solution 1
  function updateSolutionVisibility() {
    if (projectileModeCheckbox.checked) {
      solution2Container.classList.remove("hidden");

      solution1VfRow.classList.remove("hidden");
      solution1GRow.classList.remove("hidden");
      solution1FlightTimeRow.classList.remove("hidden");
      solution1RangeRow.classList.remove("hidden");
      solution1MaxHeightRow.classList.remove("hidden");
      solution1HeightRow.classList.remove("hidden");
      solution1AngleRow.classList.remove("hidden");

      solution1ARow.classList.add("hidden");
      solution1TRow.classList.add("hidden");
      solution1DRow.classList.add("hidden");

      solution2V0Row.classList.remove("hidden");
      solution2VfRow.classList.remove("hidden");
      solution2GRow.classList.remove("hidden");
      solution2TimeRow.classList.remove("hidden");
      solution2RangeRow.classList.remove("hidden");
      solution2MaxHeightRow.classList.remove("hidden");
      solution2HRow.classList.remove("hidden");
      solution2AngleRow.classList.remove("hidden");

      resultsGrid.classList.add("md:grid-cols-2");
      resultsGrid.classList.remove("md:grid-cols-1");
      document.querySelector(".mt-6 h2").textContent =
        "Results (Two Solutions)";
    } else {
      solution2Container.classList.add("hidden");

      solution1GRow.classList.add("hidden");
      solution1HeightRow.classList.add("hidden");
      solution1AngleRow.classList.add("hidden");
      solution1RangeRow.classList.add("hidden");
      solution1MaxHeightRow.classList.add("hidden");
      solution1FlightTimeRow.classList.add("hidden");

      solution1VfRow.classList.remove("hidden");
      solution1ARow.classList.remove("hidden");
      solution1TRow.classList.remove("hidden");
      solution1DRow.classList.remove("hidden");

      solution2V0Row.classList.add("hidden");
      solution2VfRow.classList.add("hidden");
      solution2GRow.classList.add("hidden");
      solution2TimeRow.classList.add("hidden");
      solution2RangeRow.classList.add("hidden");
      solution2MaxHeightRow.classList.add("hidden");
      solution2HRow.classList.add("hidden");
      solution2AngleRow.classList.add("hidden");

      resultsGrid.classList.remove("md:grid-cols-2");
      resultsGrid.classList.add("md:grid-cols-1");
      document.querySelector(".mt-6 h2").textContent = "Results";
    }
  }

  // Event listener for Projectile Mode checkbox
  projectileModeCheckbox.addEventListener("change", function () {
    const isProjectileMode = this.checked;

    projectileInputsContainer.classList.toggle("hidden", !isProjectileMode);

    if (isProjectileMode) {
      accelerationLabel.textContent = "Gravity [m/s²]";
      accelerationInput.value = "-9.81"; // Default gravity value
      accelerationInput.disabled = false; // Make it editable
      accelerationInput.classList.remove("bg-gray-200"); // Remove grayed-out style

      constantVelocityControlRow.classList.add("hidden"); // Hide constant velocity checkbox

      // If constant velocity was checked, implicitly uncheck it and reset affected inputs
      if (constantVelocityCheckbox.checked) {
        constantVelocityCheckbox.checked = false; // Uncheck it
        // Re-enable final velocity input, as acceleration is handled by gravity
        finalVelocityInput.disabled = false;
        finalVelocityInput.classList.remove("bg-gray-200");
      }
    } else {
      accelerationLabel.textContent = "Acceleration [m/s²]";
      // Clear gravity value, re-enable acceleration input, and remove disabled styling
      accelerationInput.value = "";
      accelerationInput.disabled = false;
      accelerationInput.classList.remove("bg-gray-200");

      constantVelocityControlRow.classList.remove("hidden"); // Show constant velocity checkbox

      // Apply constant velocity state immediately as it becomes visible/relevant again
      applyConstantVelocityState();
    }

    // Reset projectile inputs (height and angle) when switching modes
    initialHeightInput.value = "0"; // Use the direct element reference
    launchAngleInput.value = ""; // Use the direct element reference

    updateCalculateButtonState(); // Update based on current input states
    updateSolutionVisibility(); // Update output panels visibility
  });

  // Event listener for Constant Velocity checkbox
  constantVelocityCheckbox.addEventListener(
    "change",
    applyConstantVelocityState
  );

  // Add an event listener to initial velocity to update final velocity if constant velocity is checked
  initialVelocityInput.addEventListener("input", function () {
    if (constantVelocityCheckbox.checked && !projectileModeCheckbox.checked) {
      finalVelocityInput.value = this.value;
    }
    updateCalculateButtonState();
  });

  // Add event listeners to all relevant input fields to update button state
  allInputElements.forEach((inputElement) => {
    if (inputElement) {
      inputElement.addEventListener("input", updateCalculateButtonState);
    }
  });
});

export function validateStep(step, data) {
  const errors = {};
  if (step === 0 && !data.target_title.trim()) {
    errors.target_title = "Add the job title you are targeting.";
  }
  if (step === 1) {
    if (!data.full_name.trim()) errors.full_name = "Enter your name to continue.";
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (data.phone && !/^[+()\d.\-\s]{7,25}$/.test(data.phone)) {
      errors.phone = "Enter a valid phone number.";
    }
    ["linkedin", "github", "portfolio"].forEach((field) => {
      const value = data[field].trim();
      if (value && !/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/i.test(value)) {
        errors[field] = "Enter a valid website URL.";
      }
    });
  }
  return errors;
}

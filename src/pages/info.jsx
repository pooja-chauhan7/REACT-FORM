
import { useState } from "react";
import "./info.css";

const initialFormData = {
  name: "",
  email: "",
  Age: "",
  dob: "",
  phone: "",
  short: "",
};

const codes = {
  India: "+91",
  England: "+44",
  "New Zealand": "+64",
  Australia: "+61",
  Pakistan: "+92",
};

const phoneLengths = {
  India: { min: 10, max: 10 },
  England: { min: 10, max: 10 },
  "New Zealand": { min: 8, max: 10 },
  Australia: { min: 9, max: 9 },
  Pakistan: { min: 10, max: 10 },
};

const availableSkills = [
  "JavaScript",
  "React",
  "HTML",
  "UI/UX Design",
  "WordPress",
  "Angular",
];

const availableInterests = [
  "Web Development",
  "App Development",
  "AI & Machine Learning",
  "Cybersecurity",
  "UI/UX Design",
];

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function calculateAge(dob) {
  if (!dob) return null;

  const [year, month, day] = dob.split("-").map(Number);
  const today = new Date();
  let age = today.getFullYear() - year;

  if (
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)
  ) {
    age--;
  }

  return age;
}

function readSavedRecords() {
  try {
    const storedData = JSON.parse(localStorage.getItem("form"));
    return Array.isArray(storedData) ? storedData : [];
  } catch {
    return [];
  }
}

function Information() {
  const [Country, setCountry] = useState("");
  const [gender, setGender] = useState("");
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [experience, setExperience] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [errors, setErrors] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [resetPopup, setResetPopup] = useState(false);

  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const [savedata, setSavedata] = useState(readSavedRecords);
  const [formdata, setFormData] = useState({ ...initialFormData });

  const maxDate = getTodayDate();
  const phoneCode = codes[Country] || "";

  const showPopup = (message, type = "error") => {
    setPopup({ show: true, message, type });
  };

  const closePopup = () => {
    setPopup({ show: false, message: "", type: "error" });
  };

  const showFieldError = (field, message) => {
    setErrors((previous) => ({ ...previous, [field]: message }));

    requestAnimationFrame(() => {
      const element = document.getElementById(field);

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus({ preventScroll: true });
      }
    });
  };

  const clearFieldError = (field) => {
    setErrors((previous) => {
      const updated = { ...previous };
      delete updated[field];
      return updated;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({ ...previous, [name]: value }));
    clearFieldError(name);

    if (name === "Age" || name === "dob") {
      clearFieldError("Age");
      clearFieldError("dob");
    }
  };

  const resetForm = () => {
    setFormData({ ...initialFormData });
    setCountry("");
    setGender("");
    setSkills([]);
    setInterests([]);
    setExperience("");
    setTermsAccepted(false);
    setNotificationsEnabled(false);
    setErrors({});
    setEditingIndex(null);
  };

  const handleDelete = (index) => {
    setDeleteIndex(index);
    closePopup();
  };

  const cancelDelete = () => {
    setDeleteIndex(null);
  };

  const confirmDelete = () => {
    if (deleteIndex === null) return;

    const updatedRecords = savedata.filter(
      (_, index) => index !== deleteIndex
    );

    try {
      localStorage.setItem("form", JSON.stringify(updatedRecords));
      setSavedata(updatedRecords);

      if (editingIndex === deleteIndex) {
        resetForm();
      } else if (editingIndex !== null && editingIndex > deleteIndex) {
        setEditingIndex(editingIndex - 1);
      }

      setDeleteIndex(null);
      showPopup("Record deleted successfully!", "success");
    } catch (error) {
      console.error("Delete error:", error);
      setDeleteIndex(null);
      showPopup("Unable to delete this record. Please try again.");
    }
  };

  const handleEdit = (item, index) => {
    setFormData({
      name: item.name || "",
      email: item.email || "",
      Age: String(item.Age ?? ""),
      dob: item.dob || "",
      phone: item.phone || "",
      short: item.short || "",
    });

    setCountry(item.Country || "");
    setGender(item.gender || "");
    setSkills(item.skills || []);
    setInterests(item.interests || []);
    setExperience(item.experience || "");
    setTermsAccepted(Boolean(item.termsAccepted));
    setNotificationsEnabled(Boolean(item.notificationsEnabled));
    setErrors({});
    setEditingIndex(index);
    closePopup();

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    closePopup();
    setErrors({});

    const name = formdata.name.trim();
    const email = formdata.email.trim();
    const age = Number(formdata.Age);
    const cleanPhone = formdata.phone.replace(/\D/g, "");

    if (!name || !/^[a-zA-Z\s'-]+$/.test(name)) {
      showFieldError("name", "Please enter a valid name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFieldError("email", "Please enter a valid email address.");
      return;
    }

    if (
      formdata.Age.trim() === "" ||
      !Number.isInteger(age) ||
      age < 1 ||
      age > 120
    ) {
      showFieldError("Age", "Age must be a whole number from 1 to 120.");
      return;
    }

    if (!formdata.dob) {
      showFieldError("dob", "Please select your date of birth.");
      return;
    }

    if (formdata.dob > maxDate) {
      showFieldError("dob", "Date of birth cannot be in the future.");
      return;
    }

    const calculatedAge = calculateAge(formdata.dob);

    if (calculatedAge < 1 || calculatedAge > 120) {
      showFieldError(
        "dob",
        "Date of birth must correspond to an age from 1 to 120."
      );
      return;
    }

    if (age !== calculatedAge) {
      showFieldError(
        "Age",
        `Your date of birth indicates an age of ${calculatedAge}.`
      );
      return;
    }

    if (!Country) {
      showFieldError("Country", "Please select your country.");
      return;
    }

    if (cleanPhone) {
      const phoneRule = phoneLengths[Country];

      if (
        phoneRule &&
        (cleanPhone.length < phoneRule.min ||
          cleanPhone.length > phoneRule.max)
      ) {
        showFieldError(
          "phone",
          `Please enter a valid phone number for ${Country}.`
        );
        return;
      }
    }

    if (skills.length === 0) {
      showFieldError("skills", "Please select at least one skill.");
      return;
    }

    if (!gender) {
      showFieldError("gender", "Please select your gender.");
      return;
    }

    if (!experience) {
      showFieldError("experience", "Please select your experience level.");
      return;
    }

    if (!termsAccepted) {
      showFieldError(
        "termsAccepted",
        "Please confirm that the information is correct."
      );
      return;
    }

    const wasEditing = editingIndex !== null;

    const record = {
      ...formdata,
      name,
      email,
      Age: age,
      Country,
      phone: cleanPhone,
      gender,
      skills,
      interests,
      experience,
      termsAccepted,
      notificationsEnabled,
    };

    const updatedRecords = wasEditing
      ? savedata.map((item, index) =>
          index === editingIndex ? record : item
        )
      : [...savedata, record];

    try {
      localStorage.setItem("form", JSON.stringify(updatedRecords));
      setSavedata(updatedRecords);
      resetForm();

      showPopup(
        wasEditing
          ? "Record updated successfully!"
          : "Information submitted successfully!",
        "success"
      );
    } catch (error) {
      console.error("Save error:", error);
      showPopup("Unable to save data. Please check browser storage.");
    }
  };

  const toggleSkill = (skill) => {
    setSkills((previous) => {
      const updated = previous.includes(skill)
        ? previous.filter((item) => item !== skill)
        : [...previous, skill];

      if (updated.length > 0) clearFieldError("skills");
      return updated;
    });
  };

  return (
    <main id="info">
      {deleteIndex !== null && (
        <div className="delete-overlay">
          <div
            className="delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <div className="delete-icon">!</div>
            <h3 id="delete-title">Delete Record?</h3>
            <p>
              Are you sure you want to delete this record? This action cannot
              be undone.
            </p>

            <div className="delete-actions">
              <button
                type="button"
                className="cancel-delete"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-delete"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {resetPopup && (
  <div className="delete-overlay">
    <div
      className="delete-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-title"
    >
      <div className="delete-icon">!</div>

      <h3 id="reset-title">Reset Form?</h3>

      <p>
        Are you sure you want to reset this form?
        All entered details will be cleared.
      </p>

      <div className="delete-actions">
        <button
          type="button"
          className="cancel-delete"
          onClick={() => setResetPopup(false)}
        >
          Cancel
        </button>

        <button
          type="button"
          className="confirm-delete"
          onClick={() => {
            resetForm();
            setResetPopup(false);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  </div>
)}

      {popup.show && (
        <div className={`custom-popup ${popup.type}`} role="status">
          <span className="popup-icon">
            {popup.type === "success" ? "✓" : "!"}
          </span>
          <p>{popup.message}</p>
          <button
            type="button"
            onClick={closePopup}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      <header className="form-header">
        <div className="form-heading">
          <span className="form-label">INFORMATION FORM</span>
          <h1>Personal Information</h1>
          <p>
            Please complete the form below with your details. Fields marked
            with * are required.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        <section className="form-section">
          <div className="section-heading">
            <span className="section-number">01</span>
            <div>
              <h2>Basic Details</h2>
              <p>Your personal and contact information</p>
            </div>
          </div>

          <div className="field-grid">
            <div className="form-field">
              <label htmlFor="name">Full Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formdata.name}
                onChange={handleChange}
                autoComplete="name"
                className={errors.name ? "input-error" : ""}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formdata.email}
                onChange={handleChange}
                autoComplete="email"
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="Age">Age *</label>
              <input
                id="Age"
                name="Age"
                type="number"
                min="1"
                max="120"
                step="1"
                placeholder="Enter your age"
                value={formdata.Age}
                onChange={handleChange}
                className={errors.Age ? "input-error" : ""}
              />
              {errors.Age && <span className="field-error">{errors.Age}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="dob">Date of Birth *</label>
              <input
                id="dob"
                name="dob"
                type="date"
                max={maxDate}
                value={formdata.dob}
                onChange={handleChange}
                className={errors.dob ? "input-error" : ""}
              />
              {errors.dob && <span className="field-error">{errors.dob}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="Country">Country *</label>
              <select
                id="Country"
                value={Country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  clearFieldError("Country");
                  clearFieldError("phone");
                }}
                className={errors.Country ? "input-error" : ""}
              >
                <option value="">Select your country</option>
                {Object.keys(codes).map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              {errors.Country && (
                <span className="field-error">{errors.Country}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="phone">Phone Number (Optional)</label>
              <div className="phone-input-wrapper">
                <span>{phoneCode}</span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter phone number (optional)"
                  value={formdata.phone}
                  onChange={handleChange}
                  autoComplete="tel-national"
                  className={errors.phone ? "input-error" : ""}
                />
              </div>
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>

            <div className="form-field full-width">
              <label htmlFor="short">Short Introduction</label>
              <textarea
                id="short"
                name="short"
                placeholder="Tell us a little about yourself"
                value={formdata.short}
                onChange={handleChange}
                rows="4"
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <div className="section-heading">
            <span className="section-number">02</span>
            <div>
              <h2>Skills & Preferences</h2>
              <p>Choose your skills and preferences</p>
            </div>
          </div>

          <div className="form-field">
            <label>Skills *</label>
            <div id="skills" className="skills-list" tabIndex={-1}>
              {availableSkills.map((item) => {
                const selected = skills.includes(item);

                return (
                  <button
                    type="button"
                    key={item}
                    className={`skill-option ${selected ? "selected" : ""}`}
                    aria-pressed={selected}
                    onClick={() => toggleSkill(item)}
                  >
                    <span>{selected ? "✓" : "+"}</span>
                    {item}
                  </button>
                );
              })}
            </div>
            {errors.skills && <span className="field-error">{errors.skills}</span>}
            <p className="field-hint">Select at least one skill.</p>
          </div>

          <div className="field-grid">
            <div className="form-field">
              <label htmlFor="interests">Interests (Multiple Select)</label>
              <select
                id="interests"
                multiple
                value={interests}
                onChange={(e) =>
                  setInterests(
                    Array.from(e.target.selectedOptions, (option) => option.value)
                  )
                }
              >
                {availableInterests.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <p className="field-hint">
                Hold Ctrl on Windows to select multiple options.
              </p>
            </div>

            <div className="form-field">
              <label>Gender *</label>
              <div id="gender" className="radio-list" tabIndex={-1}>
                {["male", "female", "other"].map((item) => (
                  <label className="radio-option" key={item}>
                    <input
                      type="radio"
                      name="gender"
                      value={item}
                      checked={gender === item}
                      onChange={(e) => {
                        setGender(e.target.value);
                        clearFieldError("gender");
                      }}
                    />
                    <span>{item.charAt(0).toUpperCase() + item.slice(1)}</span>
                  </label>
                ))}
              </div>
              {errors.gender && <span className="field-error">{errors.gender}</span>}
            </div>

            <div className="form-field">
              <label>Experience Level *</label>
              <div id="experience" className="radio-list" tabIndex={-1}>
                {["beginner", "intermediate", "advanced"].map((item) => (
                  <label className="radio-option" key={item}>
                    <input
                      type="radio"
                      name="experience"
                      value={item}
                      checked={experience === item}
                      onChange={(e) => {
                        setExperience(e.target.value);
                        clearFieldError("experience");
                      }}
                    />
                    <span>{item.charAt(0).toUpperCase() + item.slice(1)}</span>
                  </label>
                ))}
              </div>
              {errors.experience && (
                <span className="field-error">{errors.experience}</span>
              )}
            </div>
          </div>

          <div className="form-field">
            <div id="termsAccepted" className="radio-option" tabIndex={-1}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  clearFieldError("termsAccepted");
                }}
              />
              <span>I confirm that the information is correct *</span>
            </div>
            {errors.termsAccepted && (
              <span className="field-error">{errors.termsAccepted}</span>
            )}
          </div>

          <div className="form-field">
            <label className="radio-option">
              <span>Enable notifications</span>
              <input
                type="checkbox"
                role="switch"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
              />
            </label>
          </div>
        </section>

        <div className="form-actions">
          <button type="button" onClick={() => setResetPopup(true)}>
            Reset
          </button>
          <button id="submit-button" type="submit">
            {editingIndex !== null ? "Update Information" : "Submit Information"}
          </button>
        </div>
      </form>

      <section className="saved-section">
        <div className="saved-heading">
          <div>
            <span className="form-label">YOUR ENTRIES</span>
            <h2>Saved Records</h2>
          </div>
          <span className="record-count">{savedata.length} records</span>
        </div>

        {savedata.length === 0 ? (
          <div className="empty-records">
            <h3>No saved records yet</h3>
            <p>Submit the form to see your information here.</p>
          </div>
        ) : (
          savedata.map((item, index) => (
            <article className="record-card" key={index}>
              <div className="record-title">
                <h3>Record {index + 1}</h3>
                <div className="record-actions">
                  <button type="button" onClick={() => handleEdit(item, index)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => handleDelete(index)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="record-details">
                <p><strong>Full Name</strong><span>{item.name}</span></p>
                <p><strong>Email Address</strong><span>{item.email}</span></p>
                <p><strong>Age</strong><span>{item.Age}</span></p>
                <p><strong>Date of Birth</strong><span>{item.dob}</span></p>
                <p>
                  <strong>Phone Number</strong>
                  <span>
                    {item.phone
                      ? `${codes[item.Country] || ""} ${item.phone}`
                      : "Not provided"}
                  </span>
                </p>
                <p><strong>Country</strong><span>{item.Country}</span></p>
                <p><strong>Gender</strong><span>{item.gender}</span></p>
                <p>
                  <strong>Skills</strong>
                  <span>{item.skills?.join(", ") || "None selected"}</span>
                </p>
                <p>
                  <strong>Interests</strong>
                  <span>{item.interests?.join(", ") || "None selected"}</span>
                </p>
                <p><strong>Experience</strong><span>{item.experience}</span></p>
                <p>
                  <strong>Terms accepted</strong>
                  <span>{item.termsAccepted ? "Yes" : "No"}</span>
                </p>
                <p>
                  <strong>Notifications</strong>
                  <span>{item.notificationsEnabled ? "Enabled" : "Disabled"}</span>
                </p>
                {item.short && (
                  <p className="record-full-width">
                    <strong>Introduction</strong>
                    <span>{item.short}</span>
                  </p>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

export default Information;

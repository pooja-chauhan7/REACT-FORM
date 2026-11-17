
import { useRef, useState } from "react";
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

  return `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function calculateAge(dob) {
  if (!dob) return null;

  const [year, month, day] = dob.split("-").map(Number);
  const today = new Date();

  let age = today.getFullYear() - year;

  if (
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month &&
      today.getDate() < day)
  ) {
    age--;
  }

  return age;
}

function readSavedRecords() {
  try {
    const data = JSON.parse(
      localStorage.getItem("form") || "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function Information() {
  const [formdata, setFormData] = useState({
    ...initialFormData,
  });

  const [Country, setCountry] = useState("");
  const [gender, setGender] = useState("");
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [experience, setExperience] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] =
    useState(false);

  const [studentPhoto, setStudentPhoto] = useState("");
  const [errors, setErrors] = useState({});
  const [savedata, setSavedata] = useState(readSavedRecords);
  const [editingIndex, setEditingIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [resetPopup, setResetPopup] = useState(false);

  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const photoInputRef = useRef(null);
  const maxDate = getTodayDate();
  const phoneCode = codes[Country] || "";

  const showPopup = (message, type = "error") => {
    setPopup({ show: true, message, type });
  };

  const closePopup = () => {
    setPopup({
      show: false,
      message: "",
      type: "error",
    });
  };

  const clearFieldError = (field) => {
    setErrors((previous) => {
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const showFieldError = (field, message) => {
    setErrors((previous) => ({
      ...previous,
      [field]: message,
    }));

    window.setTimeout(() => {
      const element = document.getElementById(field);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        element.focus?.({ preventScroll: true });
      }
    }, 0);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    clearFieldError(name);

    if (name === "Age" || name === "dob") {
      clearFieldError("Age");
      clearFieldError("dob");
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      showPopup(
        "Please select a JPG, JPEG, PNG or WEBP image."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      showPopup(
        "Photo must be 1 MB or smaller to save reliably."
      );

      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setStudentPhoto(reader.result);
        clearFieldError("studentPhoto");

        showPopup("Photo selected successfully.", "success");
      } else {
        showPopup("Could not read this photo.");
      }
    };

    reader.onerror = () => {
      showPopup("Could not read this photo. Try another image.");
    };

    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setStudentPhoto("");

    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }

    clearFieldError("studentPhoto");
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
    setStudentPhoto("");
    setErrors({});
    setEditingIndex(null);

    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }
  };


const persistRecords = (records) => {
    try {
        localStorage.setItem("form", JSON.stringify(records));

        const check = JSON.parse(
            localStorage.getItem("form") || "[]"
        );

        if (
            !Array.isArray(check) ||
            check.length !== records.length
        ) {
            throw new Error("Data could not be saved.");
        }

        setSavedata(check);

        console.log("Data saved successfully:", check);

    } catch (error) {
        console.error("LocalStorage Error:", error);
        throw error;
    }
};

  const toggleSkill = (skill) => {
    setSkills((previous) => {
      const next = previous.includes(skill)
        ? previous.filter((item) => item !== skill)
        : [...previous, skill];

      if (next.length > 0) {
        clearFieldError("skills");
      }

      return next;
    });
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

    setSkills(
      Array.isArray(item.skills) ? item.skills : []
    );

    setInterests(
      Array.isArray(item.interests) ? item.interests : []
    );

    setExperience(item.experience || "");
    setTermsAccepted(Boolean(item.termsAccepted));
    setNotificationsEnabled(Boolean(item.notificationsEnabled));
    setStudentPhoto(item.studentPhoto || "");

    setEditingIndex(index);
    setErrors({});
    closePopup();

    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
      
    closePopup();

    const name = formdata.name.trim();
    const email = formdata.email.trim().toLowerCase();
    const age = Number(formdata.Age);
    const cleanPhone = formdata.phone.replace(/\D/g, "");

    const validationErrors = {};

    if (!name || !/^[a-zA-Z\s'-]+$/.test(name)) {
      validationErrors.name = "Enter a valid full name.";
    }
const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

if (!email || !emailRegex.test(email)) {
  validationErrors.email = "Please enter a valid email address.";
}


    if (
      formdata.Age.trim() === "" ||
      !Number.isInteger(age) ||
      age < 5 ||
      age > 120
    ) {
      validationErrors.Age =
        "Age must be a whole number from 5 to 120.";
    }

    if (!formdata.dob) {
      validationErrors.dob = "Select your date of birth.";
    } else if (formdata.dob > maxDate) {
      validationErrors.dob =
        "Date of birth cannot be in the future.";
    } else {
      const calculatedAge = calculateAge(formdata.dob);

      if (calculatedAge < 5 || calculatedAge > 120) {
        validationErrors.dob =
          "Date of birth must indicate an age from 5 to 120.";
      } else if (age !== calculatedAge) {
        validationErrors.Age =
          `Your date of birth indicates an age of ${calculatedAge}.`;
      }
    }

    if (!Country) {
      validationErrors.Country = "Select your country.";
    }

    if (cleanPhone && Country) {
      const rule = phoneLengths[Country];

      if (
        rule &&
        (cleanPhone.length < rule.min ||
          cleanPhone.length > rule.max)
      ) {
        validationErrors.phone =
          `Enter a valid phone number for ${Country}.`;
      }
    }

    if (skills.length === 0) {
      validationErrors.skills = "Select at least one skill.";
    }

    if (!gender) {
      validationErrors.gender = "Select your gender.";
    }

    if (!experience) {
      validationErrors.experience =
        "Select your experience level.";
    }

    if (!termsAccepted) {
      validationErrors.termsAccepted =
        "Confirm that the information is correct.";
    }

   if (Object.keys(validationErrors).length > 0) {
  setErrors(validationErrors);

  const firstField = Object.keys(validationErrors)[0];

  showPopup(validationErrors[firstField], "error");

  showFieldError(
    firstField,
    validationErrors[firstField]
  );

  return;
}

    const isEditing = editingIndex !== null;

    const duplicate = savedata.some((item, index) => {
      if (isEditing && index === editingIndex) {
        return false;
      }

      return (
        String(item.email || "").trim().toLowerCase() === email
      );
    });

    if (duplicate) {
      showPopup(
        "This email already exists in another saved record."
      );
      return;
    }

    const record = {
      ...formdata,
      name,
      email,
      Age: age,
      Country,
      phone: cleanPhone,
      gender,
      skills: [...skills],
      interests: [...interests],
      experience,
      termsAccepted,
      notificationsEnabled,
      studentPhoto,
    };

    const updatedRecords = isEditing
      ? savedata.map((item, index) =>
          index === editingIndex ? record : item
        )
      : [...savedata, record];

    try {
      persistRecords(updatedRecords);
      resetForm();

      showPopup(
        isEditing
          ? "Record updated successfully!"
          : "Information submitted successfully!",
        "success"
      );
    } catch (error) {
      console.error("Saving records failed:", error);

      showPopup(
        "Could not save. Browser storage may be full. Remove the photo or delete an old record and try again."
      );
    }
  };

  const handleDelete = (index) => {
    setDeleteIndex(index);
  };

  const confirmDelete = () => {
    if (deleteIndex === null) return;

    const updatedRecords = savedata.filter(
      (_, index) => index !== deleteIndex
    );

    try {
      persistRecords(updatedRecords);

      if (editingIndex === deleteIndex) {
        resetForm();
      } else if (
        editingIndex !== null &&
        editingIndex > deleteIndex
      ) {
        setEditingIndex(editingIndex - 1);
      }

      setDeleteIndex(null);
      showPopup("Record deleted successfully.", "success");
    } catch (error) {
      console.error("Delete failed:", error);
      setDeleteIndex(null);
      showPopup("Could not delete the record.");
    }
  };

  return (
    <main id="info">
      {deleteIndex !== null && (
        <div className="delete-overlay">
          <div className="delete-modal" role="dialog" aria-modal="true">
            <h3>Delete Record?</h3>
            <p>This action cannot be undone.</p>
            <div className="delete-actions">
              <button type="button" className="cancel-delete" onClick={() => setDeleteIndex(null)}>
                Cancel
              </button>
              <button type="button" className="confirm-delete" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {resetPopup && (
        <div className="delete-overlay">
          <div className="delete-modal" role="dialog" aria-modal="true">
            <h3>Reset Form?</h3>
            <p>All entered details will be cleared.</p>
            <div className="delete-actions">
              <button type="button" className="cancel-delete" onClick={() => setResetPopup(false)}>
                Cancel
              </button>
              <button type="button" className="confirm-delete" onClick={() => {
                resetForm();
                setResetPopup(false);
              }}>
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
          <button type="button" onClick={closePopup}>×</button>
        </div>
      )}

      <header className="form-header">
        <div className="form-heading">
          <span className="form-label">INFORMATION FORM</span>
          <h1>Personal Information</h1>
          <p>Please complete the form below. Fields marked with * are required.</p>
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
              <input id="name" name="name" value={formdata.name} onChange={handleChange} placeholder="Enter your full name" className={errors.name ? "input-error" : ""} />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="email">Email Address *</label>
              <input id="email" name="email" type="email" value={formdata.email} onChange={handleChange} placeholder="you@example.com" className={errors.email ? "input-error" : ""} />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="Age">Age *</label>
              <input id="Age" name="Age" type="number" min="5" max="120" step="1" value={formdata.Age} onChange={handleChange} placeholder="Enter your age" className={errors.Age ? "input-error" : ""} />
              {errors.Age && <span className="field-error">{errors.Age}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="dob">Date of Birth *</label>
              <input id="dob" name="dob" type="date" max={maxDate} value={formdata.dob} onChange={handleChange} className={errors.dob ? "input-error" : ""} />
              {errors.dob && <span className="field-error">{errors.dob}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="Country">Country *</label>
              <select id="Country" value={Country} onChange={(e) => {
                setCountry(e.target.value);
                clearFieldError("Country");
                clearFieldError("phone");
              }} className={errors.Country ? "input-error" : ""}>
                <option value="">Select your country</option>
                {Object.keys(codes).map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              {errors.Country && <span className="field-error">{errors.Country}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="phone">Phone Number (Optional)</label>
              <div className="phone-input-wrapper">
                <span>{phoneCode || "+00"}</span>
                <input id="phone" name="phone" type="tel" value={formdata.phone} onChange={handleChange} placeholder="Enter phone number" className={errors.phone ? "input-error" : ""} />
              </div>
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="studentPhoto">Student Photo (Optional)</label>
              <input
                ref={photoInputRef}
                id="studentPhoto"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
              />

              {studentPhoto && (
                <div className="photo-preview-container">
                  <a href={studentPhoto} target="_blank" rel="noreferrer">
                    <img
                      src={studentPhoto}
                      alt="Student preview"
                      className="student-photo-preview"
                    />
                  </a>
                  <button type="button" className="remove-photo-button" onClick={removePhoto}>
                    Remove Photo
                  </button>
                </div>
              )}
              <p className="field-hint">JPG, PNG or WEBP; maximum 1 MB. Click photo to view full size.</p>
            </div>

            <div className="form-field full-width">
              <label htmlFor="short">Short Introduction</label>
              <textarea id="short" name="short" rows="4" value={formdata.short} onChange={handleChange} placeholder="Tell us a little about yourself" />
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
              {availableSkills.map((skill) => {
                const selected = skills.includes(skill);
                return (
                  <button type="button" key={skill} className={`skill-option ${selected ? "selected" : ""}`} aria-pressed={selected} onClick={() => toggleSkill(skill)}>
                    <span>{selected ? "✓" : "+"}</span> {skill}
                  </button>
                );
              })}
            </div>
            {errors.skills && <span className="field-error">{errors.skills}</span>}
          </div>

          <div className="field-grid">
            <div className="form-field">
              <label htmlFor="interests">Interests (Multiple Select)</label>
              <select id="interests" multiple value={interests} onChange={(e) => setInterests(Array.from(e.target.selectedOptions, (option) => option.value))}>
                {availableInterests.map((interest) => (
                  <option key={interest} value={interest}>{interest}</option>
                ))}
              </select>
              <p className="field-hint">Hold Ctrl on Windows to select multiple.</p>
            </div>

            <div className="form-field">
              <label>Gender *</label>
              <div id="gender" className="radio-list" tabIndex={-1}>
                {["male", "female", "other"].map((item) => (
                  <label className="radio-option" key={item}>
                    <input type="radio" name="gender" value={item} checked={gender === item} onChange={(e) => {
                      setGender(e.target.value);
                      clearFieldError("gender");
                    }} />
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
                    <input type="radio" name="experience" value={item} checked={experience === item} onChange={(e) => {
                      setExperience(e.target.value);
                      clearFieldError("experience");
                    }} />
                    <span>{item.charAt(0).toUpperCase() + item.slice(1)}</span>
                  </label>
                ))}
              </div>
              {errors.experience && <span className="field-error">{errors.experience}</span>}
            </div>
          </div>

          <div className="form-field">
            <div id="termsAccepted" className="radio-option" tabIndex={-1}>
              <input type="checkbox" checked={termsAccepted} onChange={(e) => {
                setTermsAccepted(e.target.checked);
                clearFieldError("termsAccepted");
              }} />
              <span>I confirm that the information is correct *</span>
            </div>
            {errors.termsAccepted && <span className="field-error">{errors.termsAccepted}</span>}
          </div>

          <div className="form-field">
            <label className="radio-option">
              <span>Enable notifications</span>
              <input type="checkbox" role="switch" checked={notificationsEnabled} onChange={(e) => setNotificationsEnabled(e.target.checked)} />
            </label>
          </div>
        </section>

        <div className="form-actions">
          <button type="button" onClick={() => setResetPopup(true)}>Reset</button>
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
            <p>Complete the required fields and submit the form.</p>
          </div>
        ) : (
          savedata.map((item, index) => (
            <article className="record-card" key={`${item.email || "record"}-${index}`}>
              <div className="record-title">
                <h3>Record {index + 1}</h3>
                <div className="record-actions">
                  <button type="button" onClick={() => handleEdit(item, index)}>Edit</button>
                  <button type="button" className="delete-button" onClick={() => handleDelete(index)}>Delete</button>
                </div>
              </div>

              <div className="record-details">
                {item.studentPhoto && (
                  <p className="record-photo">
                    <strong>Student Photo</strong>
                    <a href={item.studentPhoto} target="_blank" rel="noreferrer">
                      <img src={item.studentPhoto} alt={`${item.name}'s photo`} className="saved-student-photo" />
                    </a>
                  </p>
                )}

                <p><strong>Full Name</strong><span>{item.name}</span></p>
                <p><strong>Email Address</strong><span>{item.email}</span></p>
                <p><strong>Age</strong><span>{item.Age}</span></p>
                <p><strong>Date of Birth</strong><span>{item.dob}</span></p>
                <p><strong>Phone Number</strong><span>{item.phone ? `${codes[item.Country] || ""} ${item.phone}` : "Not provided"}</span></p>
                <p><strong>Country</strong><span>{item.Country}</span></p>
                <p><strong>Gender</strong><span>{item.gender}</span></p>
                <p><strong>Skills</strong><span>{item.skills?.join(", ") || "None selected"}</span></p>
                <p><strong>Interests</strong><span>{item.interests?.join(", ") || "None selected"}</span></p>
                <p><strong>Experience</strong><span>{item.experience}</span></p>
                <p><strong>Terms accepted</strong><span>{item.termsAccepted ? "Yes" : "No"}</span></p>
                <p><strong>Notifications</strong><span>{item.notificationsEnabled ? "Enabled" : "Disabled"}</span></p>
                {item.short && (
                  <p className="record-full-width">
                    <strong>Introduction</strong><span>{item.short}</span>
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

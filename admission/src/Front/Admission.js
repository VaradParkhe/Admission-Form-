import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import Select from 'react-select';
import * as Yup from 'yup';
import { saveAs } from 'file-saver';
import { Link } from 'react-router-dom';  // Add this line
import {districtTalukaData} from './districtTalukaData'
import styles from './Admission.css';


function AForm() {

    const [titleOptions, setTitleOptions] = useState([]);
    const [records, setRecords] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const religionOptions = [
        { value: 'Hindu', label: 'Hindu' },
        { value: 'Muslim', label: 'Muslim' },
        { value: 'Christian', label: 'Christian' },
        { value: 'Sikh', label: 'Sikh' },
        { value: 'Buddhist', label: 'Buddhist' },
        { value: 'Other', label: 'Other' },
    ];
    

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = () => {
        fetch('http://localhost:3000/records')
            .then((response) => response.json())
            .then((data) => setRecords(data))
            .catch((error) => console.error('Error fetching records:', error));
    };

    const formik = useFormik({
        initialValues: {
            title: '',
            firstName: '',
            middleName: '',
            lastName: '',
            fullName: '',
            motherName: '',
            gender: '',
            address: '',
            taluka: '',
            district: '',
            pinCode: '',
            state: '',
            mobileNumber: '',
            emailId: '',
            aadhaarNumber: '',
            dob: '',
            age: '',
            religion: '',
            casteCategory: '',
            caste: '',
            physicallyHandicapped: '',
            casteCertificate: null,
            marksheet: null,
            photo: null,
            signature: null,
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Title is required'),
            firstName: Yup.string().matches(/^[A-Za-z\s]+$/, 'First Name should contain only letters and spaces').required('First Name is required'),
            middleName: Yup.string().matches(/^[A-Za-z\s]+$/, 'Middle Name should contain only letters and spaces').required('Middle Name is required'),
            lastName: Yup.string().matches(/^[A-Za-z\s]+$/, 'Last Name should contain only letters and spaces').required('Last Name is required'),
            motherName: Yup.string().matches(/^[A-Za-z\s]+$/, 'Mother Name should contain only letters and spaces').required("Mother's Name is required"),
            gender: Yup.string().required('Gender is required'),
            address: Yup.string().required('Address is required'),
            taluka: Yup.string().required('Taluka is required'),
            district: Yup.string().required('District is required'),
            pinCode: Yup.string()
                .matches(/^[0-9]{6}$/, 'Invalid Pin Code')
                .required('Pin Code is required'),
            state: Yup.string().required('State is required'),
            mobileNumber: Yup.string()
               .matches(/^[6-9]\d{9}$/, 'Must be a valid 10-digit number starting with 6, 7, 8, or 9')
                .required('Mobile Number is required'),
            emailId: Yup.string().email('Invalid Email Address').required('Email is required'),
            aadhaarNumber: Yup.string()
                .matches(/^[0-9]{12}$/, 'Invalid Aadhaar Number')
                .required('Aadhaar Number is required'),
            dob: Yup.date().required('Date of Birth is required'),
            religion: Yup.string().required('Religion is required'),
            casteCategory: Yup.string().required('Caste Category is required'),
            caste: Yup.string().required('Caste is required'),
            physicallyHandicapped: Yup.string().required('Please select an option'),
            casteCertificate: Yup.mixed().required('Caste certificate is required'),
            marksheet: Yup.mixed().required('Marksheet is required'),
            photo: Yup.mixed().required('Photo is required'),
            signature: Yup.mixed().required('Signature is required'),
        }),
        onSubmit: (values) => {
            const formDataToSubmit = new FormData();
            for (const key in values) {
                formDataToSubmit.append(key, values[key]);
            }

            const url = editingId
                ? `http://localhost:3000/update/${editingId}`
                : 'http://localhost:3000/submit';

            fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                body: formDataToSubmit,
            })
                .then((response) => response.text())
                .then((data) => {
                    alert(data);
                    fetchRecords(); // Refresh the records list
                    formik.resetForm(); // Reset the form
                    setEditingId(null); // Clear the editing ID
                })
                .catch((error) => console.error('Error submitting the form:', error));
        },
    });

    useEffect(() => {
        const { firstName, middleName, lastName } = formik.values;
        const generatedFullName = `${firstName} ${middleName} ${lastName}`.trim();

        formik.setFieldValue('fullName', generatedFullName);
    }, [formik.values.firstName, formik.values.middleName, formik.values.lastName]);

    useEffect(() => {
        const { dob } = formik.values;
        if (dob) {
            const birthDate = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age -= 1;
            }
            formik.setFieldValue('age', age);
        } else {
            formik.setFieldValue('age', '');
        }
    }, [formik.values.dob]);

    const [talukas, setTalukas] = useState([]);
    

    const handleEdit = (record) => {
        // Set the form fields to the record values
        formik.setValues({
            title: record.title,
            firstName: record.firstName,
            middleName: record.middleName,
            lastName: record.lastName,
            fullName: `${record.firstName} ${record.middleName} ${record.lastName}`, // Automatically generate the full name
            motherName: record.motherName,
            gender: record.gender,
            address: record.address,
            taluka: record.taluka,
            district: record.district,
            pinCode: record.pinCode,
            state: record.state,
            mobileNumber: record.mobileNumber,
            emailId: record.emailId,
            aadhaarNumber: record.aadhaarNumber,
            dob: record.dob,
            age: record.age, // Age should be manually updated on form submission or calculated if needed
            religion: record.religion,
            casteCategory: record.casteCategory,
            caste: record.caste,
            physicallyHandicapped: record.physicallyHandicapped,
            casteCertificate: record.casteCertificate || null, // Set file field values to null if empty
            marksheet: record.marksheet || null,
            photo: record.photo || null,
            signature: record.signature || null
        });
    
        // Set the editing ID to the current record's ID
        setEditingId(record.id);
    };

    const handleGenderChange = (e) => {
        const selectedGender = e.target.value;
        formik.setFieldValue('gender', selectedGender);
        let titles = [];
        if (selectedGender === 'Male') {
          titles = ['Mr.'];
        } else if (selectedGender === 'Female') {
          titles = [ 'Mrs.'];
        } else {
          titles = ['Mx.'];
        }
        setTitleOptions(titles);
        formik.setFieldValue('title', titles[0] || ''); // Set default title
      };

    const handleDistrictChange = (e) => {
        const selectedDistrict = e.target.value;
        formik.setFieldValue('district', selectedDistrict);
        setTalukas(districtTalukaData[selectedDistrict] || []);
        formik.setFieldValue('taluka', ''); // Reset taluka when district changes
      };
    

    const handleDelete = (id) => {
        fetch(`http://localhost:3000/delete/${id}`, {
            method: 'DELETE',
        })
            .then((response) => response.text())
            .then((data) => {
                alert(data);
                fetchRecords();
            })
            .catch((error) => console.error('Error deleting the record:', error));
    };

    const exportToExcel = () => {
        fetch('http://localhost:3000/export')
            .then((response) => response.blob())
            .then((blob) => {
                saveAs(blob, 'records.xlsx');
            })
            .catch((error) => console.error('Error exporting to Excel:', error));
    };

    return (
        <div className="form-container">
            <h1>Admission Form</h1>
            <nav ><Link to="/">Home</Link> | <Link to="/records">Show Records</Link> | </nav>
            <form onSubmit={formik.handleSubmit}>
                <label>Title <span style={{ color: 'red' }}>*</span></label>
                <select
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                >
                    <option value="">Select</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Mx.">Mx.</option>
                </select>
                {formik.touched.title && formik.errors.title && <div className="error">{formik.errors.title}</div>}

                <label>First Name <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="text"
                    name="firstName"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.firstName && formik.errors.firstName && (
                    <div className="error">{formik.errors.firstName}</div>
                )}

                <label>Middle Name <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="text"
                    name="middleName"
                    value={formik.values.middleName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.middleName && formik.errors.middleName && (
                    <div className="error">{formik.errors.middleName}</div>
                )}

                <label>Last Name <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="text"
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.lastName && formik.errors.lastName && (
                    <div className="error">{formik.errors.lastName}</div>
                )}

                <label>Full Name </label>
                <input
                    type="text"
                    name="fullName"
                    placeholder='Autofield'
                    value={formik.values.fullName}
                    readOnly
                />

                <label>Mother's Name <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="text"
                    name="motherName"
                    value={formik.values.motherName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.motherName && formik.errors.motherName && <div className="error">{formik.errors.motherName}</div>}

                <div className={styles['form-fields']}>
          <label>Gender:</label>
          <select name="gender" value={formik.values.gender} onChange={handleGenderChange}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {formik.touched.gender && formik.errors.gender && <div className={styles.error}>{formik.errors.gender}</div>}
        </div>

                <label>Address <span style={{ color: 'red' }}>*</span></label>
                <textarea
                    name="address"
                    value={formik.values.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                ></textarea>
                {formik.touched.address && formik.errors.address && <div className="error">{formik.errors.address}</div>}

                

                <div className={styles['form-fields']}>

          <label>District:</label>
          <select name="district" value={formik.values.district} onChange={handleDistrictChange}>
            <option value="">Select District</option>
            {Object.keys(districtTalukaData).map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          {formik.touched.district && formik.errors.district && <div className={styles.error}>{formik.errors.district}</div>}
        </div>

        {/* ✅ Taluka Dropdown */}
        <div className={styles['form-fields']}>
          <label>Taluka:</label>
          <select name="taluka" value={formik.values.taluka} onChange={formik.handleChange} disabled={!formik.values.district}>
            <option value="">Select Taluka</option>
            {talukas.map((taluka) => (
              <option key={taluka} value={taluka}>{taluka}</option>
            ))}
          </select>
          {formik.touched.taluka && formik.errors.taluka && <div className={styles.error}>{formik.errors.taluka}</div>}
        </div>
                

                <label>Pin Code <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="text"
                    name="pinCode"
                    value={formik.values.pinCode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.pinCode && formik.errors.pinCode && <div className="error">{formik.errors.pinCode}</div>}

                <label>State <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="text"
                    name="state"
                    value={formik.values.state}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.state && formik.errors.state && <div className="error">{formik.errors.state}</div>}

                <label>Mobile Number <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="text"
                    name="mobileNumber"
                    value={formik.values.mobileNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.mobileNumber && formik.errors.mobileNumber && <div className="error">{formik.errors.mobileNumber}</div>}

                <label>Email ID <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="email"
                    name="emailId"
                    value={formik.values.emailId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.emailId && formik.errors.emailId && <div className="error">{formik.errors.emailId}</div>}

                <label>Aadhaar Number <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="text"
                    name="aadhaarNumber"
                    value={formik.values.aadhaarNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.aadhaarNumber && formik.errors.aadhaarNumber && <div className="error">{formik.errors.aadhaarNumber}</div>}

                <label>Date of Birth <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="date"
                    name="dob"
                    value={formik.values.dob}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.dob && formik.errors.dob && <div className="error">{formik.errors.dob}</div>}

                <label>Age</label>
                <input
                    type="text"
                    name="age"
                    placeholder='Autofield'
                    value={formik.values.age}
                    readOnly
                />

                <label>Religion <span style={{ color: 'red' }}>*</span></label>
                <Select
                    name="religion"
                    options={religionOptions}
                    value={religionOptions.find(option => option.value === formik.values.religion)}
                    onChange={(option) => formik.setFieldValue('religion', option.value)}
                />
                {formik.touched.religion && formik.errors.religion && <div className="error">{formik.errors.religion}</div>}

                <label>Caste Category <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="text"
                    name="casteCategory"
                    value={formik.values.casteCategory}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.casteCategory && formik.errors.casteCategory && <div className="error">{formik.errors.casteCategory}</div>}

                <label>Caste <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="text"
                    name="caste"
                    value={formik.values.caste}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                />
                {formik.touched.caste && formik.errors.caste && <div className="error">{formik.errors.caste}</div>}

                <label>Physically Handicapped <span style={{ color: 'red' }}>*</span></label>
                <div className="radio-group">
                    <label>
                        <input
                            type="radio"
                            name="physicallyHandicapped"
                            value="Yes"
                            checked={formik.values.physicallyHandicapped === 'Yes'}
                            onChange={formik.handleChange}
                        />
                        Yes
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="physicallyHandicapped"
                            value="No"
                            checked={formik.values.physicallyHandicapped === 'No'}
                            onChange={formik.handleChange}
                        />
                        No
                    </label>
                </div>
                {formik.touched.physicallyHandicapped && formik.errors.physicallyHandicapped && (
                    <div className="error">{formik.errors.physicallyHandicapped}</div>
                )}
                <label>Upload Caste Certificate <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="file"
                    name="casteCertificate"
                    onChange={(event) =>
                        formik.setFieldValue('casteCertificate', event.currentTarget.files[0])
                    }
                />
                {formik.touched.casteCertificate && formik.errors.casteCertificate && (
                    <div className="error">{formik.errors.casteCertificate}</div>
                )}

                <label>Upload Marksheet <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="file"
                    name="marksheet"
                    onChange={(event) =>
                        formik.setFieldValue('marksheet', event.currentTarget.files[0])
                    }
                />
                {formik.touched.marksheet && formik.errors.marksheet && (
                    <div className="error">{formik.errors.marksheet}</div>
                )}

                <label>Upload Photo <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="file"
                    name="photo"
                    onChange={(event) =>
                        formik.setFieldValue('photo', event.currentTarget.files[0])
                    }
                />
                {formik.touched.photo && formik.errors.photo && (
                    <div className="error">{formik.errors.photo}</div>
                )}

                <label>Upload Signature <span style={{ color: 'red' }}>*</span></label>
                <input
                    type="file"
                    name="signature"
                    onChange={(event) =>
                        formik.setFieldValue('signature', event.currentTarget.files[0])
                    }
                />
                {formik.touched.signature && formik.errors.signature && (
                    <div className="error">{formik.errors.signature}</div>
                )}
                <br/>

                <button type="submit">{editingId ? 'Update' : 'Submit'}</button>
                <br/>
            </form>
            <br/>
            <button onClick={exportToExcel}>Export to Excel</button>
            <br/>

           
            
            <table border="1" width="100%">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Full Name</th>
                        <th>Mother's Name</th>
                        <th>Gender</th>
                        <th>Address</th>
                        <th>Religion</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((record) => (
                        <tr key={record.id}>
                            <td>{record.title}</td>
                            <td>{`${record.firstName} ${record.middleName} ${record.lastName}`}</td>
                            <td>{record.motherName}</td>
                            <td>{record.gender}</td>
                            <td>{record.address}</td>
                            <td>{record.religion}</td>
                            <td>
                                <button onClick={() => handleEdit(record)}>Edit</button>
                                <br/>
                                <button onClick={() => handleDelete(record.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AForm;

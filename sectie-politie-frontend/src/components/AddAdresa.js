import React, { useState } from 'react';
import axios from 'axios';
import './styles/TableStyles.css';
import toast from 'react-hot-toast'; // <--- IMPORT

const AddAdresa = ({ onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        strada: '',
        numar: '',
        bloc: '',
        apartament: '',
        localitate: '',
        judetSauSector: ''
    });
    const [errors, setErrors] = useState({});

    const handleSave = () => {
        const token = localStorage.getItem('token');
        const payload = {
            ...formData,
            apartament: formData.apartament ? formData.apartament : null
        };

        axios.post('http://localhost:8080/api/adrese', payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((response) => {
                // MODIFICARE AICI:
                const newId = response.data ? response.data.idAdresa : null;

                setErrors({});
                toast.success("Adresă înregistrată!");
                onSaveSuccess(newId); // Trimitem ID-ul
            })
            .catch(err => {
                if (err.response && err.response.status === 400) {
                    setErrors(err.response.data);
                    toast.error("Verifică câmpurile invalide!");
                } else {
                    toast.error("Eroare la salvare!"); // <--- TOAST
                }
            });
    };

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    return (
        <div>
            <div className="form-group">
                <input
                    name="judetSauSector" placeholder="Județ / Sector" className="modal-input"
                    value={formData.judetSauSector} onChange={handleChange}
                />
                {errors.judetSauSector && <span style={{color: 'red', fontSize: '12px'}}>{errors.judetSauSector}</span>}

                <input
                    name="localitate" placeholder="Localitate" className="modal-input"
                    value={formData.localitate} onChange={handleChange}
                />
                {errors.localitate && <span style={{color: 'red', fontSize: '12px'}}>{errors.localitate}</span>}

                <input
                    name="strada" placeholder="Stradă" className="modal-input"
                    value={formData.strada} onChange={handleChange}
                />
                {errors.strada && <span style={{color: 'red', fontSize: '12px'}}>{errors.strada}</span>}

                <div style={{display:'flex', gap:'10px'}}>
                    <div style={{width:'30%'}}>
                        <input name="numar" placeholder="Nr." className="modal-input" value={formData.numar} onChange={handleChange} />
                        {errors.numar && <span style={{color: 'red', fontSize: '12px'}}>{errors.numar}</span>}
                    </div>
                    <div style={{width:'30%'}}>
                        <input name="bloc" placeholder="Bloc" className="modal-input" value={formData.bloc} onChange={handleChange} />
                        {errors.bloc && <span style={{color: 'red', fontSize: '12px'}}>{errors.bloc}</span>}
                    </div>
                    <div style={{width:'30%'}}>
                        <input name="apartament" placeholder="Ap." className="modal-input" value={formData.apartament} onChange={handleChange} />
                        {errors.apartament && <span style={{color: 'red', fontSize: '12px'}}>{errors.apartament}</span>}
                    </div>
                </div>
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>Salvați Adresa</button>
            </div>
        </div>
    );
};

export default AddAdresa;
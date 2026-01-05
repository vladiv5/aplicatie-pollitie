import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles/TableStyles.css';
import toast from 'react-hot-toast'; // <--- IMPORT

const EditAdresa = ({ id, onSaveSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        strada: '',
        numar: '',
        bloc: '',
        apartament: '',
        localitate: '',
        judetSauSector: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (id) {
            const token = localStorage.getItem('token');
            axios.get(`http://localhost:8080/api/adrese/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    const data = res.data;
                    setFormData({
                        strada: data.strada || '',
                        numar: data.numar || '',
                        bloc: data.bloc || '',
                        apartament: data.apartament || '',
                        localitate: data.localitate || '',
                        judetSauSector: data.judetSauSector || ''
                    });
                })
                .catch(err => toast.error("Eroare încărcare date!"));
        }
    }, [id]);

    const handleSave = () => {
        const token = localStorage.getItem('token');
        const payload = {
            ...formData,
            apartament: formData.apartament ? formData.apartament : null
        };

        axios.put(`http://localhost:8080/api/adrese/${id}`, payload, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then((response) => {
                // MODIFICARE AICI:
                const updatedId = response.data ? response.data.idAdresa : id;

                setErrors({});
                toast.success("Adresă actualizată!");
                onSaveSuccess(updatedId); // Trimitem ID-ul
            })
            .catch(err => {
                if (err.response && err.response.status === 400) {
                    setErrors(err.response.data);
                } else {
                    toast.error("Eroare la modificare!"); // <--- TOAST
                }
            });
    };

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    return (
        <div>
            <div className="form-group">
                <label>Județ / Sector</label>
                <input
                    name="judetSauSector" className="modal-input"
                    value={formData.judetSauSector} onChange={handleChange}
                />
                {errors.judetSauSector && <span style={{color: 'red', fontSize: '12px'}}>{errors.judetSauSector}</span>}

                <label>Localitate</label>
                <input
                    name="localitate" className="modal-input"
                    value={formData.localitate} onChange={handleChange}
                />
                {errors.localitate && <span style={{color: 'red', fontSize: '12px'}}>{errors.localitate}</span>}

                <label>Stradă</label>
                <input
                    name="strada" className="modal-input"
                    value={formData.strada} onChange={handleChange}
                />
                {errors.strada && <span style={{color: 'red', fontSize: '12px'}}>{errors.strada}</span>}

                <div style={{display:'flex', gap:'10px'}}>
                    <div style={{width:'30%'}}>
                        <label>Nr.</label>
                        <input name="numar" className="modal-input" value={formData.numar} onChange={handleChange} />
                        {errors.numar && <span style={{color: 'red', fontSize: '12px'}}>{errors.numar}</span>}
                    </div>
                    <div style={{width:'30%'}}>
                        <label>Bloc</label>
                        <input name="bloc" className="modal-input" value={formData.bloc} onChange={handleChange} />
                        {errors.bloc && <span style={{color: 'red', fontSize: '12px'}}>{errors.bloc}</span>}
                    </div>
                    <div style={{width:'30%'}}>
                        <label>Ap.</label>
                        <input name="apartament" className="modal-input" value={formData.apartament} onChange={handleChange} />
                        {errors.apartament && <span style={{color: 'red', fontSize: '12px'}}>{errors.apartament}</span>}
                    </div>
                </div>
            </div>

            <div className="modal-footer">
                <button className="save-btn" onClick={handleSave}>Salvați Modificări</button>
            </div>
        </div>
    );
};

export default EditAdresa;
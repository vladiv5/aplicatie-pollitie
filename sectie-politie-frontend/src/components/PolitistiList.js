import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const PolitistiList = () => {
    const [politisti, setPolitisti] = useState([]);
    const [termenCautare, setTermenCautare] = useState('');

    useEffect(() => {
        axios.get('http://localhost:8080/api/politisti')
            .then(response => {
                setPolitisti(response.data);
                console.log("Date primite:", response.data); // Pentru verificare în consolă
            })
            .catch(error => {
                console.error("A apărut o eroare la preluarea datelor!", error);
            });
    }, []);

    const handleDelete = (id) => {
        axios.delete(`http://localhost:8080/api/politisti/${id}`)
            .then(() => {
                console.log("Stergere reusita pentru ID-ul:", id);
                setPolitisti(politisti.filter(p => p.idPolitist !== id));
            })
            .catch(error => {
                console.error("A aparut o eroare la stergerea datelor:", error);
            });
    };

    const handleSearch = (e) => {
        const valoare = e.target.value;
        setTermenCautare(valoare);

        if (valoare.length > 0) {
            axios.get(`http://localhost:8080/api/politisti/cauta?termen=${valoare}`)
                .then((response) => {
                    setPolitisti(response.data);
                })
                .catch(error => console.error(error));
        } else {
            axios.get('http://localhost:8080/api/politisti')
                .then((response) => {
                    setPolitisti(response.data);
                })
                .catch(error => console.error(error));
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Lista Polițiștilor (Din SQL Server)</h2>

            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Cauta dupa nume sau prenume..."
                    value={termenCautare}
                    onChange={handleSearch}
                    style={{ padding: '8px', width: '300px' }}
                />
            </div>


            <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                    <th>ID</th>
                    <th>Nume</th>
                    <th>Prenume</th>
                    <th>Grad</th>
                    <th>Funcție</th>
                    <th>Telefon</th>
                    <th>Actiuni</th>
                </tr>
                </thead>
                <tbody>

                {politisti.map(politist => (
                    <tr key={politist.idPolitist}>
                        <td>{politist.idPolitist}</td>
                        <td>{politist.nume}</td>
                        <td>{politist.prenume}</td>
                        <td>{politist.grad}</td>
                        <td>{politist.functie}</td>
                        <td>{politist.telefon_serviciu}</td>
                        <td>
                            <Link to={`/politisti/edit/${politist.idPolitist}`} style={{ textDecoration: 'none' }}>
                                <button style={{ marginRight: '10px', backgroundColor: '#ffa500', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
                                    Edit
                                </button>
                            </Link>
                            <button
                                onClick={() => handleDelete(politist.idPolitist)}
                                style={{ color: 'red'}}
                            >
                                Sterge
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default PolitistiList;
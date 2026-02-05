import { importContacts } from '../../api/contactsApi';

const ImportContacts = () => {
  const handleImport = async (e) => {
    const file = e.target.files[0];
    const text = await file.text();
    const rows = text.split('\n').slice(1);

    const contacts = rows.map(r => {
      const [name, email, phone] = r.split(',');
      return { name, email, phone };
    });

    await importContacts(contacts);
    alert('Imported!');
  };

  return <input type="file" accept=".csv" onChange={handleImport} />;
};

export default ImportContacts;

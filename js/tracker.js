 const Tracker = {

    getAll() {
        try {
            const data = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEYS.TRACKER);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error reading tracker data:', e);
            return [];
        }
    },

    save(entries) {
        try {
            localStorage.setItem(CONFIG.LOCAL_STORAGE_KEYS.TRACKER, JSON.stringify(entries));
        } catch (e) {
            console.error('Error saving tracker data:', e);
        }
    },

    add(entry) {
        const entries = this.getAll();
        const newEntry = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            clientType: entry.clientType || 'Unknown',
            skills: entry.skills || [],
            outreachType: entry.outreachType || 'email',
            message: entry.message || '',
            subject: entry.subject || '',
            status: 'sent',
            date: new Date().toISOString(),
            notes: ''
        };
        entries.unshift(newEntry);
        this.save(entries);
        return newEntry;
    },

    updateStatus(id, status) {
        const entries = this.getAll();
        const entry = entries.find(e => e.id === id);
        if (entry) {
            entry.status = status;
            this.save(entries);
        }
        return entries;
    },

    updateNotes(id, notes) {
        const entries = this.getAll();
        const entry = entries.find(e => e.id === id);
        if (entry) {
            entry.notes = notes;
            this.save(entries);
        }
        return entries;
    },

    delete(id) {
        let entries = this.getAll();
        entries = entries.filter(e => e.id !== id);
        this.save(entries);
        return entries;
    },

    clearAll() {
        this.save([]);
    },

    getStats() {
        const entries = this.getAll();
        return {
            total: entries.length,
            sent: entries.filter(e => e.status === 'sent').length,
            replied: entries.filter(e => e.status === 'replied').length,
            converted: entries.filter(e => e.status === 'converted').length
        };
    },

    getFiltered(filter) {
        const entries = this.getAll();
        if (filter === 'all') return entries;
        return entries.filter(e => e.status === filter);
    }
};

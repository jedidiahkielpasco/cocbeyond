import { useState, useEffect } from 'react'
import './App.css'
import {
    SKILLS, generateAttributes, rollNd6, generateOccupationData
} from './AppLogic.js';
import { OCCUPATIONS } from './occupations.js';


// coc_webapp_starter - React + Tailwind project



function App() {
    const [roll, setRoll] = useState(null);
    const [step, setStep] = useState(0);
    const [character, setCharacter] = useState({
        name: "",
        familyname: "",
        age: "",
        occupation: "",
        residence: "",
        birthplace: "",
        backstory: {
            personalDescription: "",
            ideology: "",
            significantPeople: "",
            meaningfulLocations: "",
            treasuredPossessions: "",
            traits: "",
            injuriesScars: "",
            phobiasManias: "",
            arcaneTomes: "",
            encounters: "",
            generalBackstory: ""
        },
        equipment: {
            weapons: "",
            tools: "",
            clothes: "",
            special: "",
            other: "",
        },
        attributes: {
            STR: 0,
            CON: 0,
            DEX: 0,
            INT: 0,
            SIZ: 0,
            POW: 0,
            APP: 0,
            EDU: 0,
            LUCK: 0,
            HP: 0,
            SAN: 0,
            MP: 0,
            Dodge: 0,
            MOV: 0,
            Personal_Points: 0,
        },
        skills: SKILLS.map((s) => ({ ...s, value: s.base, improved: false })),
    });

    const [occupationDetails, setOccupationDetails] = useState(null);

    const [debouncedOccupation, setDebouncedOccupation] = useState("");

    const [attributeRollResults, setAttributeRollResults] = useState({});


    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedOccupation(character.occupation);
        }, 2500); // number here is the delay in microseconds
        return () => clearTimeout(handler);
    }, [character.occupation]);




    //useOccupationEffect(debouncedOccupation, setOccupationDetails);

    const steps = ["Attributes", "Identity", "Skills", "Equipment", "Backstory", "Condensed Character Sheet"];



    const rollDice = (index, target, isAttribute = false) => {
        const d100 = Math.floor(Math.random() * 100) + 1;
        let result = 'Fail';
        if (d100 <= target) result = 'Success';
        if (d100 <= target / 2) result = 'Hard Success';
        if (d100 <= target / 5) result = 'Extreme Success';

        if (isAttribute) {
            setAttributeRollResults(prev => ({ ...prev, [index]: { d100, result } }));
        } else {
            const updatedSkills = [...character.skills];
            updatedSkills[index].rollResult = { d100, result };
            setCharacter(prev => ({ ...prev, skills: updatedSkills }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCharacter((prev) => ({ ...prev, [name]: value }));
    };

    const handleAttrChange = (e) => {
        const { name, value } = e.target;
        setCharacter((prev) => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [name]: Number(value),
            },
        }));
    };

    const handleEquipmentChange = (e) => {
        const { name, value } = e.target;
        setCharacter((prev) => ({
            ...prev,
            equipment: {
                ...prev.equipment,
                [name]: value,
            },
        }));
    };



    const handleSkillChange = (index, value) => {
        setCharacter((prev) => {
            const updatedSkills = [...prev.skills];
            updatedSkills[index].value = Number(value);
            return { ...prev, skills: updatedSkills };
        });
    };

    const toggleSkillImproved = (index) => {
        setCharacter((prev) => {
            const updatedSkills = [...prev.skills];
            updatedSkills[index].improved = !updatedSkills[index].improved;
            return { ...prev, skills: updatedSkills };
        });
    };

    const splitSkillsIntoColumns = (skills, columns) => {
        const perColumn = Math.ceil(skills.length / columns);
        return Array.from({ length: columns }, (_, colIndex) =>
            skills.slice(colIndex * perColumn, colIndex * perColumn + perColumn)
        );
    };


    const skillColumns = splitSkillsIntoColumns(character.skills, 5);


    const rollWeaponDamage = (damageString) => {
        const regex = /^(\d*)d(\d+)([+-]\d+)?$/i;
        const match = damageString.toLowerCase().replace(/\s+/g, '').match(regex);

        if (!match) return 'Invalid';

        const numDice = parseInt(match[1] || '1', 10); // Defaults to 1 if blank
        const diceSides = parseInt(match[2], 10);
        const modifier = parseInt(match[3] || '0', 10);

        let total = 0;
        for (let i = 0; i < numDice; i++) {
            total += Math.floor(Math.random() * diceSides) + 1;
        }

        return total + modifier;
    };

    const saveCharacter = () => {
        try {
            const cleanedSkills = character.skills.map(({ name, base, value, improved }) => ({
                name,
                base,
                value,
                improved: !!improved,
            }));

            const characterToSave = {
                ...character,
                skills: cleanedSkills,
            };

            localStorage.setItem('coc_character_data', JSON.stringify(characterToSave));
            alert("Character saved to Local Storage.");
        } catch (error) {
            console.error("Error saving character:", error);
            alert("Save failed.");
        }
    };

    const loadCharacter = () => {
        try {
            const savedData = localStorage.getItem('coc_character_data');
            if (savedData) {
                const parsedCharacter = JSON.parse(savedData);
                setCharacter(parsedCharacter);
                alert("Character loaded from Local Storage.");
            } else {
                alert("No saved character found.");
            }
        } catch (error) {
            console.error("Error loading character:", error);
            alert("Load failed.");
        }
    };





    const getOccupationSkillTotal = () => {
        if (!occupationDetails || !Array.isArray(occupationDetails.skills)) return 0;

        return character.skills.reduce((sum, s) => {
            const isOccupationSkill = occupationDetails.skills.includes(s.name);
            const spent = s.value - s.base;
            return isOccupationSkill && spent > 0 ? sum + spent : sum;
        }, 0);
    };

    const getPersonalSkillTotal = () => {
        if (!occupationDetails || !Array.isArray(occupationDetails.skills)) return 0;

        return character.skills.reduce((sum, s) => {
            const isOccupationSkill = occupationDetails.skills.includes(s.name);
            const spent = s.value - s.base;
            return !isOccupationSkill && spent > 0 ? sum + spent : sum;
        }, 0);
    };

    const autoGenerateEquipment = async () => {
        alert("AI Generation features have been disabled in the local version as the backend was removed.");
    };



    const isCharacterReady = () =>
        Object.values(character.attributes).every(val => val > 0);

    const [weaponRollResult, setWeaponRollResult] = useState(null);


    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <div className="bg-eldritch-panel/30 rounded-xl shadow-lg p-4 border border-eldritch-accent mb-6">
                        <h2 className="text-xl font-bold mb-3 text-eldritch-highlight uppercase tracking-wide">Attributes</h2>

                        <div className="grid grid-cols-3 gap-4">
                            {Object.entries(character.attributes).map(([attr, val]) => (
                                <div key={attr} className="flex flex-col text-center items-center">
                                    <label className="text-eldritch-accent text-sm font-medium mb-1">{attr}</label>
                                    <input type="number" name={attr} value={val} onChange={handleAttrChange} className="text-black px-2 py-1 rounded w-20 text-center" />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-1/2 gap-6 mb-6">
                            <div className="bg-eldritch-panel/30 rounded-xl shadow-lg p-4 border border-eldritch-accent">
                                <h2 className="text-xl font-bold mb-3 text-eldritch-highlight uppercase tracking-wide">Identity</h2>
                                <label className="block mb-1 text-eldritch-accent">Name</label>
                                <input type="text" name="name" value={character.name} onChange={handleInputChange} className="text-black px-2 py-1 rounded w-full mb-3" />
                                <label className="block mb-1 text-eldritch-accent">Sur Name</label>
                                <input type="text" name="familyname" value={character.familyname} onChange={handleInputChange} className="text-black px-2 py-1 rounded w-full mb-3" />
                                <label className="block mb-1 text-eldritch-accent">Occupation</label>
                                <select
                                    name="occupation"
                                    value={character.occupation}
                                    onChange={(e) => {
                                        const selectedOccupation = OCCUPATIONS.find(o => o.name === e.target.value);
                                        setCharacter(prev => ({
                                            ...prev,
                                            occupation: selectedOccupation.name,
                                        }));
                                        setOccupationDetails(selectedOccupation);
                                    }}
                                    className="text-black px-2 py-1 rounded w-full mb-3"
                                >
                                    <option value="">Select Occupation</option>
                                    {OCCUPATIONS.map((occ) => (
                                        <option key={occ.name} value={occ.name}>
                                            {occ.name}
                                        </option>
                                    ))}
                                </select>
                                <label className="block mb-1 text-eldritch-accent">Age</label>
                                <input type="number" name="age" value={character.age} onChange={handleInputChange} className="text-black px-2 py-1 rounded w-full mb-3" />
                                <text ></text>
                                <label className="block mb-1 text-eldritch-accent">Residence</label>
                                <input type="text" name="residence" value={character.residence} onChange={handleInputChange} className="text-black px-2 py-1 rounded w-full mb-3" />
                                <label className="block mb-1 text-eldritch-accent">Birthplace</label>
                                <input type="text" name="birthplace" value={character.birthplace} onChange={handleInputChange} className="text-black px-2 py-1 rounded w-full mb-3" />
                            </div>
                        </div>
                        {occupationDetails && (
                            <div className="w-full md:w-1/2 gap-6 mb-6">
                                <div className="bg-eldritch-panel/30 rounded-xl shadow-lg p-4 border border-eldritch-accent">
                                    <h2 className="text-xl font-bold mb-3 text-eldritch-highlight uppercase tracking-wide">Additional Info</h2>
                                    <label className="block mb-3 text-eldritch-accent">
                                        Occupation Data: <span className="text-sm font-medium mb-1 text-[#5856f3]">{occupationDetails.description}</span>
                                    </label>
                                    <label className="block mb-3 text-eldritch-accent">
                                        Credit Rating: <span className="text-sm font-medium mb-1 text-[#5856f3]">{occupationDetails.creditRating}</span>
                                    </label>
                                    <label className="block mb-3 text-eldritch-accent">
                                        Occupation Skills: <span className="text-sm font-medium mb-1 text-[#5856f3]">{occupationDetails.skills.join(', ')}</span>
                                    </label>
                                    <label className="block mb-3 text-eldritch-accent">
                                        Occupation Pts: <span className="text-sm font-medium mb-1 text-[#5856f3]">{occupationDetails.points}</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 2:
                return (
                    <div className="bg-eldritch-panel/30 rounded-xl shadow-lg p-4 border border-eldritch-accent mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-eldritch-highlight uppercase tracking-wide">Skills</h2>
                            {occupationDetails && (
                                <div className="text-sm text-right text-eldritch-highlight font-mono">
                                    <p>
                                        Occupation: {getOccupationSkillTotal()} / {occupationDetails.points || "?"}
                                    </p>
                                    <p>
                                        Personal: {getPersonalSkillTotal()} / {character.attributes.Personal_Points || "?"}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {skillColumns.map((column, colIdx) => (
                                <div key={colIdx} className="flex flex-col gap-4">
                                    {column.map((skill, index) => (
                                        <div key={skill.name} className="bg-eldritch-panel/45 p-2 rounded border border-gray-600 shadow-md">
                                            <label className="block font-semibold text-sm mb-1 text-eldritch-highlight tracking-wide">{skill.name}</label>
                                            <div className="flex items-center gap-2">
                                                <input type="number" value={skill.value} onChange={(e) => handleSkillChange(character.skills.findIndex((s) => s.name === skill.name), e.target.value)} className="text-black px-2 py-1 rounded w-20 text-sm" />
                                                <input type="checkbox" checked={skill.improved} onChange={() => toggleSkillImproved(character.skills.findIndex((s) => s.name === skill.name))} />
                                                <span className="text-xs text-gray-400">✓</span>
                                                <button onClick={() => rollDice(character.skills.findIndex((s) => s.name === skill.name), skill.value)} className="ml-auto px-3 py-1 bg-[#4ca892] hover:bg-eldritch-highlight text-xs rounded">Roll</button>{skill.rollResult && (<div className="text-xs mt-1 text-eldritch-accent ml-2">{skill.rollResult.d100} - {skill.rollResult.result}</div>)}
                                            </div>
                                            <div className="text-xs mt-1 text-gray-400">Half: {Math.floor(skill.value / 2)} | Fifth: {Math.floor(skill.value / 5)}</div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="bg-eldritch-panel/45 rounded-xl shadow-lg p-4 border border-eldritch-accent mb-6">
                        <h2 className="text-xl font-bold mb-4 text-eldritch-highlight uppercase tracking-wide">Equipment</h2>
                        <button
                            onClick={autoGenerateEquipment}
                            className="ml-2 px-3 py-1 bg-eldritch-link hover:bg-eldritch-link/80 text-sm rounded"
                        >
                            Auto-Generate
                        </button>

                        {Object.entries(character.equipment).map(([category, value]) => (
                            <div key={category} className="mb-4">
                                <label className="block text-eldritch-accent font-semibold mb-1 uppercase tracking-wide">{category}</label>

                                {category === "weapons" && value && typeof value === "object" ? (
                                    [value].map((weapon, idx) => (
                                        <div key={idx} className="mb-4 p-3 bg-gray-800/40 rounded border border-gray-600">
                                            <p className="text-eldritch-accent font-bold text-lg mb-2">{weapon.name}</p>
                                            <p className="text-sm text-gray-300">
                                                <span className="text-eldritch-highlight">Damage:</span> {weapon.damage} |{" "}
                                                <span className="text-eldritch-highlight">Range:</span> {weapon.range} |{" "}
                                                <span className="text-eldritch-highlight">Uses/Round:</span> {weapon.usesPerRound} |{" "}
                                                <span className="text-eldritch-highlight">Bullets:</span> {weapon.bullets || "N/A"} |{" "}
                                                <span className="text-eldritch-highlight">Cost:</span> {weapon.cost} |{" "}
                                                <span className="text-eldritch-highlight">Malfunction:</span> {weapon.malfunction || "N/A"}
                                            </p>
                                        </div>
                                    ))
                                ) : category === "tools" && Array.isArray(value) ? (
                                    value.map((tool, idx) => (
                                        <div key={idx} className="mb-3 p-3 bg-gray-800/40 rounded border border-gray-600">
                                            <p className="text-eldritch-accent font-bold">{tool.name}</p>
                                            <p className="text-gray-300 text-sm mb-1">{tool.description}</p>
                                            <p className="text-gray-400 text-xs italic">Use: {tool.useCase}</p>
                                            <p className="text-sm text-white">Qty: {tool.quantity || 1}, Cost: {tool.cost}, Wt: {tool.weight} lbs</p>
                                        </div>
                                    ))
                                ) : category === "clothes" && Array.isArray(value) ? (
                                    value.map((item, idx) => (
                                        <div key={idx} className="mb-3 p-3 bg-gray-800/40 rounded border border-gray-600">
                                            <p className="text-eldritch-accent font-bold">{item.name}</p>
                                            <p className="text-gray-300 text-sm mb-1">{item.description}</p>
                                            <p className="text-sm text-white">Qty: {item.quantity || 1}, Cost: {item.cost}, Wt: {item.weight} lbs</p>
                                        </div>
                                    ))
                                ) : Array.isArray(value) ? (
                                    value.map((item, idx) => (
                                        <div key={idx} className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => {
                                                    const updatedItems = [...value];
                                                    updatedItems[idx].name = e.target.value;
                                                    setCharacter((prev) => ({
                                                        ...prev,
                                                        equipment: {
                                                            ...prev.equipment,
                                                            [category]: updatedItems
                                                        }
                                                    }));
                                                }}
                                                className="text-black px-2 py-1 rounded w-1/2"
                                                placeholder="Item name"
                                            />
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => {
                                                    const updatedItems = [...value];
                                                    updatedItems[idx].quantity = parseInt(e.target.value, 10);
                                                    setCharacter((prev) => ({
                                                        ...prev,
                                                        equipment: {
                                                            ...prev.equipment,
                                                            [category]: updatedItems
                                                        }
                                                    }));
                                                }}
                                                className="text-black px-2 py-1 rounded w-1/6"
                                                placeholder="Qty"
                                            />
                                            <input
                                                type="number"
                                                value={item.weight}
                                                onChange={(e) => {
                                                    const updatedItems = [...value];
                                                    updatedItems[idx].weight = parseFloat(e.target.value);
                                                    setCharacter((prev) => ({
                                                        ...prev,
                                                        equipment: {
                                                            ...prev.equipment,
                                                            [category]: updatedItems
                                                        }
                                                    }));
                                                }}
                                                className="text-black px-2 py-1 rounded w-1/6"
                                                placeholder="Weight"
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <textarea
                                        name={category}
                                        value={value}
                                        onChange={handleEquipmentChange}
                                        rows={3}
                                        className="w-full p-2 rounded text-black"
                                        placeholder={`Enter ${category} items...`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                );
            case 4:
                return (
                    <div className="bg-eldritch-panel rounded-xl shadow-lg p-6 border border-eldritch-accent mb-6">
                        <h2 className="text-xl font-bold mb-6 text-eldritch-highlight uppercase tracking-wide">Backstory & Details</h2>
                        <div className="flex flex-col md:flex-row gap-6">

                            {/* Left side - General Backstory (2/3) and narratively related fields */}
                            <div className="w-full md:w-3/5 space-y-6">
                                {["generalBackstory", "personalDescription", "ideology", "significantPeople"].map((field) => (
                                    <div key={field}>
                                        <label className="block mb-1 text-eldritch-accent capitalize font-semibold">
                                            {field
                                                .replace(/([A-Z])/g, ' $1')
                                                .replace(/^generalBackstory$/, "Backstory")
                                                .replace(/\b\w/g, l => l.toUpperCase())}
                                        </label>
                                        <textarea
                                            name={field}
                                            value={character.backstory[field] || ""}
                                            onChange={(e) =>
                                                setCharacter((prev) => ({
                                                    ...prev,
                                                    backstory: {
                                                        ...prev.backstory,
                                                        [field]: e.target.value,
                                                    },
                                                }))
                                            }
                                            rows={field === "generalBackstory" ? 6 : 5}
                                            className="w-full p-3 rounded text-black resize-y"
                                            placeholder={`Enter ${field === "generalBackstory" ? "main backstory" : field}...`}
                                        />
                                    </div>
                                ))}
                            </div>
                            {/* Right side - other fields (1/3) */}
                            <div className="w-full md:w-2/5 space-y-4">
                                {Object.entries(character.backstory)
                                    .filter(([key]) => !["generalBackstory", "personalDescription", "ideology", "significantPeople"].includes(key))
                                    .map(([field, value]) => (
                                        <div key={field}>
                                            <label className="block mb-1 text-eldritch-accent capitalize font-semibold">
                                                {field
                                                    .replace(/([A-Z])/g, ' $1')
                                                    .replace(/\b\w/g, l => l.toUpperCase())}
                                            </label>
                                            <textarea
                                                name={field}
                                                value={value}
                                                onChange={(e) =>
                                                    setCharacter(prev => ({
                                                        ...prev,
                                                        backstory: {
                                                            ...prev.backstory,
                                                            [field]: e.target.value
                                                        }
                                                    }))
                                                }
                                                rows={3}
                                                className="w-full p-2 rounded text-black resize-none"
                                                placeholder={`Enter ${field}...`}
                                            />
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                );


            case 5:
                return isCharacterReady() ? (
                    <div className="bg-eldritch-panel/45 rounded-xl shadow-lg p-4 border border-eldritch-accent mb-6">
                        <h2 className="text-2xl font-bold mb-6 text-eldritch-highlight uppercase tracking-wide">Summary</h2>

                        {/* Identity + Attributes */}
                        <div className="flex flex-col md:flex-row gap-6 mb-6">
                            {/* Identity Section */}
                            <div className="w-full md:w-1/3 space-y-4">
                                <h3 className="text-xl font-semibold text-eldritch-link mb-2">Identity</h3>
                                <p><strong>Name:</strong> {character.name}</p>
                                <p><strong>Occupation:</strong> {character.occupation}</p>
                                <p className="text-s"><strong>Occupation Data:</strong> {occupationDetails.description}</p>
                                <p><strong>Age:</strong> {character.age}</p>
                                <p><strong>Residence:</strong> {character.residence}</p>
                                <p><strong>Birthplace:</strong> {character.birthplace}</p>
                            </div>

                            {/* Attributes Section */}
                            <div className="w-full md:w-2/3 space-y-4">
                                <h3 className="text-xl font-bold text-eldritch-link mb-1">Attributes</h3>
                                <div className="grid grid-cols-4 gap-3">
                                    {Object.entries(character.attributes).map(([key, val], index) => (
                                        <div key={key} className="bg-eldritch-panel p-2 rounded border border-gray-700 text-center">
                                            <p className="text-eldritch-accent font-bold">{key}</p>
                                            <p className="text-white text-xl">{val}</p>
                                            <button
                                                onClick={() => rollDice(index, val, true)}
                                                className="mt-2 px-2 py-1 text-xs bg-eldritch-link hover:bg-eldritch-link/80 rounded"
                                            >
                                                Roll
                                            </button>
                                            {attributeRollResults[index] && (
                                                <div className="text-xs text-eldritch-accent mt-1">
                                                    🎲 {attributeRollResults[index].d100} – {attributeRollResults[index].result}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 mb-6">
                            {/* Skills Section */}
                            <div className="w-full md:w-1/2">
                                <h3 className="text-lg font-semibold text-eldritch-link mb-2">Skills</h3>
                                <div className="space-y-1 text-sm text-white">
                                    {character.skills.map((skill, idx) => (
                                        <div
                                            key={skill.name}
                                            className="flex items-center justify-between bg-eldritch-panel/25 px-2 py-1 rounded border border-gray-700"
                                        >
                                            <div className="w-2/5 truncate text-eldritch-highlight font-medium">{skill.name}</div>
                                            <div className="w-1/4 text-xs text-gray-300 text-center">
                                                {skill.value} / {Math.floor(skill.value / 2)} / {Math.floor(skill.value / 5)}
                                            </div>
                                            <button
                                                onClick={() => rollDice(idx, skill.value)}
                                                className="px-2 py-0.5 text-xs bg-eldritch-link hover:bg-eldritch-link/80 rounded"
                                            >
                                                Roll
                                            </button>
                                            {skill.rollResult && (
                                                <div className="text-eldritch-accent text-xs ml-2 whitespace-nowrap">
                                                    🎲 {skill.rollResult.d100} – {skill.rollResult.result}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Equipment Section */}
                            <div className="w-full md:w-1/2">
                                <h3 className="text-lg font-semibold text-eldritch-link mb-2">Equipment</h3>
                                {Object.entries(character.equipment).map(([category, items]) => (
                                    <div key={category} className="mb-4">
                                        <p className="text-eldritch-accent font-bold mb-2 uppercase tracking-wide">{category}</p>

                                        {/* Weapon (object) */}
                                        {category === "weapons" && items && typeof items === 'object' ? (
                                            <div className="bg-eldritch-panel/25 p-3 rounded border border-gray-700 space-y-1 text-sm text-white">
                                                <p className="font-semibold text-eldritch-highlight">{items.name}</p>
                                                <p>
                                                    Damage: {items.damage}, Range: {items.range}, Uses/Round: {items.usesPerRound}<br />
                                                    Bullets: {items.bullets || 'N/A'}, Cost: {items.cost}, Malfunction: {items.malfunction}
                                                </p>
                                                <button
                                                    onClick={() => setWeaponRollResult(rollWeaponDamage(items.damage))}
                                                    className="mt-1 px-2 py-1 text-xs bg-eldritch-link hover:bg-eldritch-link/80 rounded"
                                                >
                                                    Roll Damage
                                                </button>
                                                {weaponRollResult !== null && (
                                                    <p className="text-xs text-eldritch-accent">🎲 Damage Rolled: {weaponRollResult}</p>
                                                )}
                                            </div>

                                            // Array-based equipment (tools, clothes, etc.)
                                        ) : Array.isArray(items) ? (
                                            <div className="grid grid-cols-1 gap-2">
                                                {items.map((item, i) => (
                                                    <div key={i} className="bg-eldritch-panel/25 p-2 rounded border border-gray-700 text-sm text-white">
                                                        <p className="font-semibold text-eldritch-highlight">{item.name}</p>
                                                        {item.description && <p className="italic text-xs text-gray-400 mb-1">{item.description}</p>}
                                                        <p>
                                                            Qty: {item.quantity}, Wt: {item.weight} lbs
                                                            {item.cost ? `, Cost: ${item.cost}` : ''}
                                                            {item.useCase ? `, Use: ${item.useCase}` : ''}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>

                                            // Text fallback
                                        ) : (
                                            <p className="text-sm text-white">{items}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-eldritch-panel/40 rounded-xl shadow-md p-6 border border-yellow-600 text-center text-yellow-200">
                        <h2 className="text-xl font-bold uppercase tracking-wide mb-2">Character Sheet Locked</h2>
                        <p className="mb-1">Please roll your Attributes and fill out the Identity information to continue.</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div className="relative z-0 min-h-screen bg-[#000000] text-black p-6 font-mono rounded-xl">
                <div className="flex justify-between items-center mb-6 border-b-4 border-eldritch-accent text-eldritch-highlight pb-2">
                    <h1 className="text-4xl font-extrabold font-cinzel mb-6 text-left tracking-wide uppercase">
                        Call of Cthulhu Character Creator
                    </h1>
                    <div className='flex gap-2'>
                        <button onClick={saveCharacter} className="px-5 py-2 bg-eldritch-accent hover:bg-[#3c8878] rounded">Save (Local)</button>
                        <button onClick={loadCharacter} className="px-5 py-2 bg-eldritch-link hover:bg-eldritch-accent/60 rounded">Load (Local)</button>
                    </div>
                </div>


                <div className="flex text-right mb-3 gap-1 overflow-x-auto md:overflow-x-visible whitespace-nowrap">
                    {steps.map((label, idx) => (
                        <button
                            key={label}
                            onClick={() => setStep(idx)}
                            className={`px-3 py-1 rounded border shrink-0 ${idx === step
                                ? 'bg-[#8effa0] text-black'
                                : 'border-eldritch-accent text-eldritch-accent'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {renderStep()}

                {roll && (
                    <div className="mt-6 bg-eldritch-panel p-4 rounded border border-eldritch-accent">
                        <p className="text-xl font-semibold">🎲 You rolled: {roll.d100}</p>
                        <p className="text-2xl font-bold text-eldritch-accent">Result: {roll.result}</p>
                        {roll.skillName && <p className="text-md text-gray-300">Skill: {roll.skillName}</p>}
                    </div>
                )}
            </div>
        </>
    );
}
export default App;
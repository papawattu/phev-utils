const defaultLevel = process.env.DEBUG ? 1 : 0

const Log = ({ level = defaultLevel } = {}) => {

    let currentLevel = level

    return {
        info: console.info,
        debug: msg => currentLevel ? console.log('DEBUG : ' + msg) : undefined,
        error: console.error,
        warn: console.warn,
        level: currentLevel,
        setLevel: level => currentLevel = level
    }
}

export default Log  

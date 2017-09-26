const defaultLevel = process.env.DEBUG ? 1 : 0

const Log = ({ level = defaultLevel } = {}) => {

    let currentLevel = level

    return {
        info: msg => console.info('INFO : ' + msg),
        debug: msg => currentLevel ? console.log('DEBUG : ' + msg) : undefined,
        error: msg => console.error('ERROR : ' + msg),
        warn: msg => console.warn('WARNING : ' + msg),
        level: currentLevel,
        setLevel: level => currentLevel = level
    }
}

export default Log  

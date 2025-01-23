function addExcludeClassRecursively(element) {
    element.classList.add('exclude-from-selection');
    element.querySelectorAll('*').forEach(addExcludeClassRecursively);
}
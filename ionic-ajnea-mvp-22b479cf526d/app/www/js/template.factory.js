(function() {

    angular
        .module('something')
        .factory('FactoryTemplate', FactoryTemplate)

    function FactoryTemplate($http) {
        return {
            getObject: getObject,
            getObjects: getObjects,
            createObject: createObject
        }

        // define factory variables here
        var object = {}

        // define factory function here

        function getObject(id) {
            return $http.get('/object' + id)
        }

        function getObjects() {
            return $http.get('/objects')
        }
    }

}())


activate()

function activate() {
    return FactoryTemplate.getObjects()
        .then(setObjects)

    function setObjects(data) {
        $scope.object = data
    }
}


package main

import (
	"fmt"
	"net/http"
	"strings"
)

func main() {
	fileServer := http.FileServer(http.Dir("public"))

	server := http.Server{
		Addr: ":80",
		Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			fmt.Println(r.URL.Path)
			if r.URL.Path != "/" && !strings.Contains(r.URL.Path, ".") {
				r.URL.Path += ".html"
			}

			fileServer.ServeHTTP(w, r)
			fmt.Println(r.URL)
		}),
	}
	if err := server.ListenAndServe(); err != nil {
		panic(err)
	}
}
